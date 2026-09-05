import type { LayoutLoaderDefinition } from 'mermaid'

// The game's NORMAL layout before Reality perks. Null slots preserve the
// positions reserved for challenge buttons; row 18 is the EC1/2/3 row.
// Source: src/components/tabs/time-studies/time-study-tree-layout.js.
const rows: (number | 'ec10' | null)[][] = [
  [null, 11, null], [21, 22], [null, 31, 32, 33], [41, 42],
  [null, 51, null], [null, 61, 62], [71, 72, 73], [81, 82, 83],
  [91, 92, 93], [101, 102, 103], [null, 111, null], [121, 122, 123],
  [null, 131, 132, 133, null], [141, 142, 143], [null, null, 151, null, null],
  [161, 162], [171], [null, null, null], [181], ['ec10'],
  [191, 192, 193], [201], [211, 212, 213, 214],
  [221, 222, 223, 224, 225, 226, 227, 228], [231, 232, 233, 234],
]
const normalWidth = 108
const wideWidth = 72
const height = 60
const rowGap = 24
const normalGap = 18
const wideGap = 3.6
const padding = 20
const rowWidth = (row: (number | string | null)[], index: number) => row.length * (index === 23 ? wideWidth : normalWidth) + (row.length - 1) * (index === 23 ? wideGap : normalGap)
export const studyGridSize = { width: Math.max(...rows.map(rowWidth)) + padding * 2, height: rows.length * height + (rows.length - 1) * rowGap + padding * 2 }
export type StudyPosition = { x: number; y: number; width: number; height: number }
export const studyPositions: Readonly<Record<string, Readonly<StudyPosition>>> = Object.freeze(Object.fromEntries(
  rows.flatMap((row, index) => {
    const width = index === 23 ? wideWidth : normalWidth
    const gap = index === 23 ? wideGap : normalGap
    const left = (studyGridSize.width - rowWidth(row, index)) / 2
    return row.flatMap((id, column) => id === null ? [] : [[typeof id === 'number' ? `s${id}` : id, Object.freeze({ x: left + column * (width + gap) + width / 2, y: padding + index * (height + rowGap) + height / 2, width, height })]])
  })
))

// Intersect the center-to-center connector with the two rectangular borders.
export function studyConnector(from: StudyPosition, to: StudyPosition): string {
  const dx = to.x - from.x, dy = to.y - from.y
  const start = Math.min(dx ? from.width / 2 / Math.abs(dx) : Infinity, dy ? from.height / 2 / Math.abs(dy) : Infinity)
  const end = Math.min(dx ? to.width / 2 / Math.abs(dx) : Infinity, dy ? to.height / 2 / Math.abs(dy) : Infinity)
  return `M ${from.x + dx * start} ${from.y + dy * start} L ${to.x - dx * end} ${to.y - dy * end}`
}

// Public Mermaid layout extension: Mermaid parses the graph and styles, and
// this renderer places them on a fixed grid instead of running automatic layout.
export const studyGridLayout: LayoutLoaderDefinition = {
  name: 'time-study-grid',
  loader: async () => ({
    render: async (data, svg) => {
      const root = svg.append('g').attr('class', 'study-grid')
      root.append('rect').attr('width', studyGridSize.width).attr('height', studyGridSize.height).attr('fill', 'transparent').attr('stroke', 'none')
      const edges = root.append('g').attr('class', 'study-grid-edges')
      for (const edge of data.edges) {
        const from = studyPositions[edge.start ?? ''], to = studyPositions[edge.end ?? '']
        if (!from || !to) throw new Error(`Unknown Time Study connection: ${edge.start} to ${edge.end}`)
        edges.append('path').attr('d', studyConnector(from, to)).attr('fill', 'none').attr('style', [...(edge.cssCompiledStyles ?? []), ...(edge.style ?? [])].join(';'))
      }
      const nodes = root.append('g').attr('class', 'study-grid-nodes')
      for (const node of data.nodes) {
        const position = studyPositions[node.id]
        if (!position) throw new Error(`Unknown Time Study position: ${node.id}`)
        const styles = [...(node.cssCompiledStyles ?? []), ...(node.cssStyles ?? [])]
        const color = [...styles].reverse().find(style => /^color\s*:/.test(style))?.split(':').slice(1).join(':').replace(/;$/, '') ?? '#d4d4d8'
        const group = nodes.append('g').attr('data-study-id', node.id).attr('transform', `translate(${position.x},${position.y})`)
        group.append('rect').attr('x', -position.width / 2).attr('y', -position.height / 2).attr('width', position.width).attr('height', position.height).attr('rx', 4).attr('style', styles.join(';'))
        group.append('text').attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('style', `fill:${color};font-size:13px;font-family:Inter Variable,sans-serif;font-weight:500`).text(node.label ?? node.id)
      }
    },
  }),
}
