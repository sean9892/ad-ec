export const routeColors = {
  None: { background: '#a1a1aa', color: '#000000' },
  Antimatter: { background: '#22aa48', color: '#000000' },
  Infinity: { background: '#b67f33', color: '#000000' },
  Time: { background: '#b241e3', color: '#000000' },
  Active: { background: '#e60000', color: '#ffffff' },
  Passive: { background: '#5e33b6', color: '#ffffff' },
  Idle: { background: '#0080ff', color: '#000000' },
} as const
export type Route = keyof typeof routeColors
export function parseStudies(value?: string | null): number[] {
  return [...new Set((value ?? '').split('|')[0].split(',').map(x => Number(x.trim())).filter(x => Number.isInteger(x) && x > 0))].sort((a,b) => a-b)
}
export function studyRoute(id: number): Route {
  if (id >= 71 && id <= 103) return ({1:'Antimatter',2:'Infinity',3:'Time'} as const)[id % 10 as 1|2|3] ?? 'None'
  if (id >= 121 && id <= 143) return ({1:'Active',2:'Passive',3:'Idle'} as const)[id % 10 as 1|2|3] ?? 'None'
  return 'None'
}
export function studyRoutes(studies: number[]) {
  const selected = new Set(studies.map(studyRoute))
  const choose = (routes: Route[]): Route[] => { const result=routes.filter(x => selected.has(x)); return result.length ? result : ['None'] }
  return { Resource: choose(['Antimatter','Infinity','Time']), Activeness: choose(['Active','Passive','Idle']) }
}
// Normal study connections from the game's time-study-connections.js.
export const connections: [number, number][] = [
 [11,21],[11,22],[21,31],[22,32],[22,33],[31,41],[32,42],[41,51],[42,51],[42,62],[51,61],
 [61,71],[61,72],[61,73],[71,81],[72,82],[73,83],[81,91],[82,92],[83,93],[91,101],[92,102],[93,103],
 [101,111],[102,111],[103,111],[111,121],[111,122],[111,123],[121,131],[122,132],[123,133],
 [131,141],[132,142],[133,143],[141,151],[142,151],[143,151],[151,161],[151,162],[161,171],[162,171],
 [171,181],[192,201],[191,211],[191,212],[193,213],[193,214],[211,221],[211,222],[212,223],[212,224],
 [213,225],[213,226],[214,227],[214,228],[221,231],[222,231],[223,232],[224,232],[225,233],[226,233],[227,234],[228,234],
]
export function studyDiagram(studies: number[], added: number[] = []): string {
  const selected=new Set(studies)
  const lines=['flowchart TD', 'accTitle: Time Study setup', 'accDescr: Selected Time Studies. NEW marks studies added at this objective.']
  for (const id of studies) lines.push(`s${id}["TS${id}${added.includes(id) ? ' · NEW' : ''}"]`)
  for (const [from,to] of connections) if (selected.has(from) && selected.has(to)) lines.push(`s${from} --> s${to}`)
  // EC10 completion is the actual gate between TS181 and row 19, not a direct TS edge.
  if (studies.some(id=>id>=191)) {
    lines.push('ec10["EC10 completed"]')
    if(selected.has(181)) lines.push('s181 --> ec10')
    for(const id of [191,192,193]) if(selected.has(id)) lines.push(`ec10 --> s${id}`)
  }
  for (const id of studies) {
    const route=studyRoute(id)
    const colors=route === 'None' ? {background:'#46bdc6',color:'#000000'} : routeColors[route]
    const late=id>=221 ? {background:id%2 ? '#111111':'#eeeeee', color:id%2 ? '#ffffff':'#000000'} : colors
    lines.push(`style s${id} fill:${late.background},color:${late.color},stroke:${added.includes(id)?'#ffffff':'#666666'},stroke-width:${added.includes(id)?'4px':'1px'}`)
  }
  return lines.join('\n')
}
