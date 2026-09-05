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
export const allStudies = [...new Set(connections.flat())].sort((a, b) => a - b)

export function studyDiagram(studies: number[]): string {
  const selected = new Set(studies)
  const lines = ['flowchart TD', 'accTitle: Full Time Study tree', 'accDescr: Colored studies belong to this objective setup. Gray studies are not bought.']
  for (const id of allStudies) lines.push(`s${id}["TS${id}"]`)
  for (const [from, to] of connections) {
    // Stagger the eight row-22 choices over two ranks, keeping the viewer compact
    // without adding imaginary prerequisite edges between alternative studies.
    const stagger = (to >= 221 && to <= 228 && to % 2 === 0) || (from >= 221 && from <= 228 && from % 2 === 1)
    lines.push(`s${from} ${stagger ? '--->' : '-->'} s${to}`)
  }
  // EC10 completion is the actual gate between TS181 and row 19.
  const pastEC10 = studies.some(id => id >= 191)
  lines.push('ec10["EC10 gate"]', 's181 --> ec10')
  for (const id of [191, 192, 193]) lines.push(`ec10 --> s${id}`)
  for (const id of allStudies) {
    const route = studyRoute(id)
    const colors = route === 'None' ? { background: '#46bdc6', color: '#000000' } : routeColors[route]
    const bought = id >= 221 ? { background: id % 2 ? '#111111' : '#eeeeee', color: id % 2 ? '#ffffff' : '#000000' } : colors
    const appearance = selected.has(id) ? bought : { background: '#45454f', color: '#d4d4d8' }
    lines.push(`style s${id} fill:${appearance.background},color:${appearance.color},stroke:${selected.has(id) ? '#eeeeee' : '#64646e'},stroke-width:${selected.has(id) ? '2px' : '1px'}`)
  }
  lines.push(`style ec10 fill:${pastEC10 ? '#46bdc6' : '#45454f'},color:${pastEC10 ? '#000000' : '#d4d4d8'},stroke:#64646e`)
  const edgeStates = connections.map(([from, to]) => selected.has(from) && selected.has(to))
  edgeStates.push(pastEC10 && selected.has(181), ...[191, 192, 193].map(id => pastEC10 && selected.has(id)))
  edgeStates.forEach((bought, index) => lines.push(`linkStyle ${index} stroke:${bought ? '#b6aabd' : '#55555f'},stroke-width:${bought ? '2px' : '1px'}`))
  return lines.join('\n')
}
