import { useEffect, useId, useState } from 'react'
import { ChevronDown, Workflow } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { routeColors, studyDiagram, studyRoutes } from '@/lib/studies'

const loadMermaid = () => import('mermaid').then(({ default: mermaid }) => {
  mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'dark', fontFamily: 'Inter Variable, sans-serif', flowchart: { htmlLabels: false, useMaxWidth: false, nodeSpacing: 20, rankSpacing: 26 } })
  return mermaid
})
let renderer: ReturnType<typeof loadMermaid> | undefined
function Diagram({ studies, added }: { studies: number[]; added: number[] }) {
  const id=useId().replace(/[^a-zA-Z0-9]/g,'')
  const [svg,setSvg]=useState('')
  const [failed,setFailed]=useState(false)
  const source=studyDiagram(studies,added)
  useEffect(() => {
    let cancelled=false
    renderer ??= loadMermaid()
    renderer.then(m=>m.render(`tree${id}`,source)).then(result=>{if(!cancelled) setSvg(result.svg)}).catch(()=>{if(!cancelled) setFailed(true)})
    return ()=>{cancelled=true}
  },[id,source])
  return <div className="study-diagram" tabIndex={0} role="region" aria-label="Time Study tree, scroll to explore">
    {svg ? <div dangerouslySetInnerHTML={{__html:svg}} /> : <p role="status">{failed ? 'Tree unavailable. Study IDs are listed below.' : 'Drawing study tree…'}</p>}
  </div>
}
export function RouteBadges({ studies }: { studies: number[] }) {
  return <div className="route-information">{Object.entries(studyRoutes(studies)).map(([label,routes])=><div className="route-field" key={label}><span>{label}</span>{routes.map(route=><Badge className="route-badge" key={route} style={{backgroundColor:routeColors[route].background,color:routeColors[route].color}}>{route}</Badge>)}</div>)}</div>
}
export function StudyTree({ studies, added=[], early=false, active }: { studies:number[]; added?:number[]; early?:boolean; active:boolean }) {
  const [open,setOpen]=useState(early)
  return <details className="study-setup" open={open} onToggle={event=>setOpen(event.currentTarget.open)}>
    <summary><Workflow size={16}/>Time Study setup<ChevronDown size={16}/></summary>
    {open && <div className="study-tree-body">{studies.length ? <>
      {added.length>0 && <p className="study-legend">NEW · {added.map(id=>`TS${id}`).join(', ')}</p>}
      {active ? <Diagram studies={studies} added={added}/> : <div className="study-diagram"/>}
      <details className="study-ids"><summary>Study IDs</summary><code>{studies.join(',')}</code></details>
    </> : <p className="study-legend">No Time Studies yet.</p>}</div>}
  </details>
}
