import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown, Workflow } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { routeColors, studyDiagram, studyRoutes } from '@/lib/studies'
import { studyGridLayout } from '@/lib/study-layout'

const loadMermaid = () => import('mermaid').then(({ default: mermaid }) => {
  mermaid.registerLayoutLoaders([studyGridLayout])
  mermaid.initialize({ layout: 'time-study-grid', startOnLoad: false, securityLevel: 'strict', theme: 'dark', fontFamily: 'Inter Variable, sans-serif', flowchart: { htmlLabels: false, useMaxWidth: false, nodeSpacing: 20, rankSpacing: 26 } })
  return mermaid
})
let renderer: ReturnType<typeof loadMermaid> | undefined
let lastPan: { left: number; top: number } | undefined
function Diagram({ studies }: { studies: number[] }) {
  const id=useId().replace(/[^a-zA-Z0-9]/g,'')
  const viewport = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; x: number; y: number; left: number; top: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [svg,setSvg]=useState('')
  const [failed,setFailed]=useState(false)
  const source=studyDiagram(studies)
  useEffect(() => {
    let cancelled=false
    renderer ??= loadMermaid()
    renderer.then(m=>m.render(`tree${id}`,source)).then(result=>{if(!cancelled) setSvg(result.svg)}).catch(()=>{if(!cancelled) setFailed(true)})
    return ()=>{cancelled=true}
  },[id,source])
  useEffect(() => {
    const element = viewport.current
    if (element && svg) {
      element.scrollLeft = lastPan?.left ?? Math.max(0, (element.scrollWidth - element.clientWidth) / 2)
      element.scrollTop = lastPan?.top ?? 0
    }
  }, [svg])
  const endDrag = () => { drag.current = null; setDragging(false) }
  return <div ref={viewport} className={`study-diagram ${dragging ? 'is-dragging' : ''}`} tabIndex={0} role="region" aria-label="Full Time Study tree. Drag or scroll to explore. Gray studies are not bought."
    onScroll={event => {
      if (svg) lastPan = { left: event.currentTarget.scrollLeft, top: event.currentTarget.scrollTop }
    }}
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary) return
      const element = event.currentTarget
      const bounds = element.getBoundingClientRect()
      if (event.clientX - bounds.left >= element.clientWidth || event.clientY - bounds.top >= element.clientHeight) return
      element.focus({ preventScroll: true })
      drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, left: element.scrollLeft, top: element.scrollTop }
      element.setPointerCapture(event.pointerId)
      setDragging(true)
      event.preventDefault()
    }}
    onPointerMove={event => {
      const start = drag.current
      if (!start || start.id !== event.pointerId) return
      event.currentTarget.scrollLeft = start.left - (event.clientX - start.x)
      event.currentTarget.scrollTop = start.top - (event.clientY - start.y)
      event.preventDefault()
    }}
    onPointerUp={event => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
      endDrag()
    }}
    onPointerCancel={endDrag}
    onLostPointerCapture={endDrag}>

    {svg ? <div dangerouslySetInnerHTML={{__html:svg}} /> : <p role="status">{failed ? 'Tree unavailable. Study IDs are listed below.' : 'Drawing study tree…'}</p>}
  </div>
}
export function RouteBadges({ studies }: { studies: number[] }) {
  return <div className="route-information">{Object.entries(studyRoutes(studies)).map(([label,routes])=><div className="route-field" key={label}><span>{label}</span>{routes.map(route=><Badge className="route-badge" key={route} style={{backgroundColor:routeColors[route].background,color:routeColors[route].color}}>{route}</Badge>)}</div>)}</div>
}
export function StudyTree({ studies, active }: { studies:number[]; active:boolean }) {
  const [open,setOpen]=useState(false)
  return <details className="study-setup" open={open} onToggle={event=>setOpen(event.currentTarget.open)}>
    <summary><Workflow size={16}/>Time Study setup<ChevronDown size={16}/></summary>
    {open && <div className="study-tree-body">
      <p className="study-legend">Drag to explore · Gray = unbought</p>
      {active ? <Diagram studies={studies}/> : <div className="study-diagram"/>}
      <details className="study-ids"><summary>Bought study IDs</summary><code>{studies.join(',') || 'None'}</code></details>
    </div>}
  </details>
}
