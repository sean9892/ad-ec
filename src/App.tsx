import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpRight, BookOpen, Check, CheckCheck, ChevronDown, CircleHelp, Clock3, Flag, Infinity as InfinityIcon, List, LockKeyhole, Mouse, RotateCcw, Sparkles, Workflow } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResourceBadge, ResourceText } from '@/components/resource-badge'
import type { Requirement } from '@/lib/resources'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import guide from '@/data/objectives.json'
import earlyStudies from '@/data/early-studies.json'
import { StudyTree, RouteBadges } from '@/components/study-tree'
import { parseStudies } from '@/lib/studies'
import { readProgress, STORAGE_KEY, toggleCompleted } from '@/lib/progress'

type Objective = { id: string; title: string; shortTitle: string; summary: string; requirements: Requirement[]; description: string; section: string; kind: string; studies?: string | null; challenge?: string | null; timeTheorems?: number | null; duration?: string | null; ipGoal?: string | null; source: { sheet: string; row: number } }
const objectives = guide.objectives as Objective[]
const ids = objectives.map(objective => objective.id)
const groups = [...new Set(objectives.map(objective => objective.section))]
const pad = (value: number) => String(value).padStart(3, '0')

function initialProgress() {
  try { return readProgress(localStorage.getItem(STORAGE_KEY), ids) }
  catch { return readProgress(null, ids) }
}

function ObjectiveList({ active, completed, onSelect, collapsed, onCollapse }: { collapsed: Set<string>; onCollapse: (group: string) => void; active: number; completed: Set<string>; onSelect: (index: number) => void }) {
  const navigation = useRef<HTMLElement>(null)
  useEffect(() => {
    const nav = navigation.current
    const selected = nav?.querySelector<HTMLElement>('[aria-current="step"]')
    if (!nav || !selected) return
    const item = selected.getBoundingClientRect()
    const viewport = nav.getBoundingClientRect()
    if (item.top < viewport.top + 20 || item.bottom > viewport.bottom - 20) {
      nav.scrollTop += item.top - viewport.top - nav.clientHeight / 2 + item.height / 2
    }
  }, [active])
  return <nav className="objective-list" ref={navigation} aria-label="All objectives">
    {groups.map((group, groupIndex) => <div className="objective-group" key={group}>
      <h3><button className="section-toggle" aria-expanded={!collapsed.has(group)} onClick={() => onCollapse(group)}><span>{String(groupIndex + 1).padStart(2, '0')}</span>{group}<ChevronDown size={14} /></button></h3>
      <ol hidden={collapsed.has(group)}>{objectives.map((objective, index) => objective.section !== group ? null : <li key={objective.id}>
        <button className={`objective-link ${completed.has(objective.id) ? 'is-complete' : ''}`} aria-current={index === active ? 'step' : undefined} onClick={() => onSelect(index)}>
          <span className="step-indicator" aria-hidden="true">{completed.has(objective.id) ? <Check size={12} strokeWidth={3} /> : index === active ? <span /> : null}</span>
          <span className="objective-link-title"><ResourceText text={objective.title} /></span>
          <span className="sr-only">{completed.has(objective.id) ? ', achieved' : ', not achieved'}</span>
        </button>
      </li>)}</ol>
    </div>)}
  </nav>
}

function CopyrightInfo() {
  return <Dialog>
    <DialogTrigger render={<Button variant="ghost" className="copyright-button" />}><CircleHelp size={16} />Copyright Info</DialogTrigger>
    <DialogContent className="copyright-dialog">
      <DialogHeader>
        <div className="dialog-symbol"><BookOpen size={23} /></div>
        <DialogTitle>Built on a community guide.</DialogTitle>
        <DialogDescription>This project is based on the “Antimatter Dimensions – Eternity and Eternity Challenges” spreadsheet.</DialogDescription>
      </DialogHeader>
      <p>The objective sequence, challenge recommendations, and Time Study setups are adapted from the supplied guide by Ninjatsu and the Antimatter Dimensions community.</p>
      <p>The original guide and game belong to their respective creators. This is an unofficial companion project.</p>
      <a className="source-link" href={guide.sourceUrl} target="_blank" rel="noopener noreferrer">View the original spreadsheet <ArrowUpRight size={17} /></a>
    </DialogContent>
  </Dialog>
}

function ObjectiveCard({ objective, index, achieved, onToggle, onNext, allComplete, active }: { active: boolean; objective: Objective; index: number; achieved: boolean; onToggle: () => void; onNext: () => void; allComplete: boolean }) {
  const early = (earlyStudies as Record<string, { studies: number[]; added: number[] }>)[objective.id]
  const studies = early?.studies ?? parseStudies(objective.studies)
  const Icon = objective.kind === 'challenge' ? Flag : objective.kind === 'study' ? Workflow : Sparkles
  return <div className="objective-content">
    <div className="section-caption"><span className="caption-line" />{objective.section}<span className="caption-line" /></div>
    <Card className={`objective-card ${achieved ? 'achieved-card' : ''}`} aria-labelledby={`title-${objective.id}`}>
      <div className="card-topline"><Badge variant="outline" className="kind-badge"><Icon size={14} />{objective.kind === 'challenge' ? 'Eternity Challenge' : objective.kind === 'study' ? 'Time Study' : 'Milestone'}</Badge><span className="card-number">{pad(index + 1)}<span> / {pad(objectives.length)}</span></span></div>
      <div className="card-body">
        <div className="objective-eyebrow">{achieved ? <><Check size={14} /> OBJECTIVE ACHIEVED</> : 'CURRENT OBJECTIVE'}</div>
        <h1 id={`title-${objective.id}`}>{objective.shortTitle}</h1>
        {objective.requirements.length > 0 && <div className="requirement-badges" aria-label="Resource requirements">{objective.requirements.map((requirement, index) => <ResourceBadge key={index} requirement={requirement} />)}</div>}
        {objective.duration && <div className="challenge-duration"><Clock3 size={14} />{objective.duration.replaceAll('~', '–')}</div>}
        {objective.summary && <p className="objective-summary"><ResourceText text={objective.summary} /></p>}
        {objective.kind === 'challenge' && <RouteBadges studies={studies} />}
        {(early || studies.length > 0) && <StudyTree studies={studies} early={!!early} active={active} />}
        {objective.description !== objective.title && <details className="guide-details"><summary>Guide details<ChevronDown size={14} /></summary><div className="objective-description">{objective.description.split('\n\n').map((text, paragraph) => <p key={paragraph}><ResourceText text={text} /></p>)}</div></details>}
      </div>
      <div className="card-actions">
        <Button className={`achieve-button ${achieved ? 'undo-button' : ''}`} variant={achieved ? 'outline' : 'default'} aria-pressed={achieved} onClick={onToggle}>{achieved ? <RotateCcw size={17} /> : <Check size={18} />}{achieved ? 'Undo achievement' : 'Mark as achieved'}</Button>
        {index < objectives.length - 1 ? <Button variant="ghost" className="next-button" onClick={onNext}>Next objective<ArrowDown size={16} /></Button> : <span className="last-objective"><Flag size={15} />Final objective</span>}
      </div>
    </Card>
    <div className="card-footnote">{allComplete ? <><CheckCheck size={16} />All objectives achieved. Eternity, conquered.</> : achieved ? <><Check size={15} />Achieved. You can undo this anytime.</> : <><Mouse size={15} />Scroll to explore nearby objectives</>}</div>
  </div>
}

export default function App() {
  const [saved] = useState(initialProgress)
  const [completed, setCompleted] = useState(saved.completed)
  const [active, setActive] = useState(Math.max(0, ids.indexOf(saved.current)))
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const toggleSection = (group: string) => setCollapsed(previous => { const next = new Set(previous); if(next.has(group)) next.delete(group); else next.add(group); return next })
  const [mobileOpen, setMobileOpen] = useState(false)
  const [storageUnavailable, setStorageUnavailable] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const scroller = useRef<HTMLDivElement>(null)
  const sections = useRef<(HTMLElement | null)[]>([])
  const activeRef = useRef(active)
  const frame = useRef<number | null>(null)
  const completeSet = new Set(completed)
  const percent = Math.round(completed.length / objectives.length * 100)
  activeRef.current = active

  const navigate = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const target = sections.current[Math.max(0, Math.min(index, objectives.length - 1))]
    const container = scroller.current
    if (!target || !container) return
    container.scrollTo({ top: target.offsetTop, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : behavior })
  }, [])

  useLayoutEffect(() => {
    navigate(ids.indexOf(saved.current), 'instant')
    const observer = new ResizeObserver(() => navigate(activeRef.current, 'instant'))
    if (scroller.current) observer.observe(scroller.current)
    return () => { observer.disconnect(); if (frame.current !== null) cancelAnimationFrame(frame.current) }
  }, [navigate, saved.current])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed, current: ids[active] }))
      setStorageUnavailable(false)
    } catch { setStorageUnavailable(true) }
  }, [completed, active])

  const onScroll = () => {
    if (frame.current !== null) return
    frame.current = requestAnimationFrame(() => {
      frame.current = null
      const container = scroller.current
      if (!container) return
      const center = container.scrollTop + container.clientHeight / 2
      let closest = 0
      let distance = Infinity
      sections.current.forEach((section, index) => {
        if (!section) return
        const gap = Math.abs(section.offsetTop + section.offsetHeight / 2 - center)
        if (gap < distance) { distance = gap; closest = index }
      })
      setActive(closest)
    })
  }

  const toggle = (index: number) => {
    const objective = objectives[index]
    setCompleted(previous => toggleCompleted(previous, objective.id))
    setAnnouncement(`${objective.title}: ${completeSet.has(objective.id) ? 'achievement undone' : 'achieved'}.`)
  }

  const selectObjective = (index: number) => { navigate(index, 'instant'); setActive(index); setMobileOpen(false) }
  const firstIncomplete = objectives.findIndex(objective => !completeSet.has(objective.id))

  return <div className="app-shell style-nova">
    <a className="skip-link" href="#objectives">Skip to current objective</a>
    <aside className="desktop-sidebar">
      <div className="brand"><span className="brand-icon"><InfinityIcon size={27} strokeWidth={1.7} /></span><div><span className="brand-game">ANTIMATTER DIMENSIONS</span><h2>Eternity guide<span className="brand-period">.</span></h2></div></div>
      <div className="list-heading"><span>ALL OBJECTIVES</span><span>{objectives.length}</span></div>
      <ObjectiveList collapsed={collapsed} onCollapse={toggleSection} active={active} completed={completeSet} onSelect={selectObjective} />
      <div className="sidebar-progress"><div className="progress-label"><span>Your progress</span><strong>{percent}%</strong></div><Progress value={percent} aria-label="Objectives achieved" /><div className="progress-count"><span><b>{completed.length}</b> of {objectives.length} achieved</span><CheckCheck size={16} /></div><div className="storage-note"><LockKeyhole size={12} />{storageUnavailable ? 'Progress is saved for this session only' : 'Progress saved in this browser'}</div></div>
    </aside>
    <main className="workspace">
      <header className="topbar">
        <div className="page-context"><Sheet open={mobileOpen} onOpenChange={setMobileOpen}><SheetTrigger render={<Button className="mobile-menu" variant="ghost" size="icon" aria-label="Open all objectives" />}><List size={21} /></SheetTrigger><SheetContent side="left" className="mobile-objectives"><SheetHeader><SheetTitle>Eternity guide</SheetTitle><SheetDescription>{completed.length} of {objectives.length} objectives achieved</SheetDescription></SheetHeader><ObjectiveList collapsed={collapsed} onCollapse={toggleSection} active={active} completed={completeSet} onSelect={selectObjective} /></SheetContent></Sheet><BookOpen size={17} className="context-icon" /><span>Eternity & challenges</span><span className="context-divider">/</span><span className="context-step">{pad(active + 1)}</span></div>
        <CopyrightInfo />
      </header>
      <div className="journey-bar"><span className="journey-title">One objective at a time.</span><Button variant="ghost" className="resume-button" disabled={firstIncomplete < 0 || active === firstIncomplete} onClick={() => selectObjective(firstIncomplete)}><Flag size={14} />{firstIncomplete < 0 ? 'Guide complete' : 'Next unfinished'}</Button></div>
      <div id="objectives" className="objective-scroller" ref={scroller} tabIndex={0} role="region" aria-label="Objective cards. Scroll or use arrow keys to navigate." onScroll={onScroll} onKeyDown={event => {
        if (event.target !== event.currentTarget) return
        if (['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault()
          navigate(event.key === 'Home' ? 0 : event.key === 'End' ? objectives.length - 1 : active + (event.key === 'ArrowDown' || event.key === 'PageDown' ? 1 : -1))
        }
      }}>
        {objectives.map((objective, index) => <section key={objective.id} className="objective-slide" ref={element => { sections.current[index] = element }} aria-label={`Objective ${index + 1} of ${objectives.length}`} inert={index !== active}>
          <ObjectiveCard active={index === active} objective={objective} index={index} achieved={completeSet.has(objective.id)} onToggle={() => toggle(index)} onNext={() => navigate(index + 1)} allComplete={completed.length === objectives.length} />
        </section>)}
      </div>
      <footer className="workspace-footer"><div className="keyboard-hint"><span><ArrowUp size={12} /></span><span><ArrowDown size={12} /></span><span>to navigate</span></div><span className="position-counter"><b>{pad(active + 1)}</b><span> / {pad(objectives.length)}</span></span><div className="navigation-buttons"><Button variant="outline" size="icon" aria-label="Previous objective" disabled={active === 0} onClick={() => navigate(active - 1)}><ArrowUp size={17} /></Button><Button variant="outline" size="icon" aria-label="Next objective" disabled={active === objectives.length - 1} onClick={() => navigate(active + 1)}><ArrowDown size={17} /></Button></div></footer>
    </main>
    <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
  </div>
}
