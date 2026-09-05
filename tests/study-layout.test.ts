import test from 'node:test'
import assert from 'node:assert/strict'
import { allStudies, studyDiagram } from '../src/lib/studies.ts'
import { studyPositions, studyGridLayout, studyGridSize, studyConnector } from '../src/lib/study-layout.ts'

test('all studies occupy the original game rows and resource columns', () => {
  for (const id of allStudies) assert(studyPositions[`s${id}`], `TS${id} has a fixed position`)
  for (const path of [[71,81,91,101], [72,82,92,102], [73,83,93,103]]) {
    assert.equal(new Set(path.map(id => studyPositions[`s${id}`].x)).size, 1)
  }
  assert(studyPositions.s71.x < studyPositions.s72.x && studyPositions.s72.x < studyPositions.s73.x)
  assert.equal(studyPositions.s11.x, studyPositions.s111.x)
  assert.equal(studyPositions.s21.x, studyPositions.s31.x)
  assert.equal(studyPositions.s22.x, studyPositions.s32.x)
  assert.equal(studyPositions.s181.y - studyPositions.s171.y, 168) // reserved EC1/2/3 row
  const bottom = [221,222,223,224,225,226,227,228].map(id => studyPositions[`s${id}`])
  assert.equal(new Set(bottom.map(node => node.y)).size, 1)
  for (let index = 1; index < bottom.length; index++) assert(bottom[index].x - bottom[index-1].x > bottom[index].width)
  assert(studyPositions.s201.y < studyPositions.s211.y && studyPositions.s211.y < studyPositions.s221.y)
})

test('connectors terminate at the fixed box borders', () => {
  assert.equal(studyConnector({x:100,y:100,width:100,height:60},{x:100,y:200,width:100,height:60}), 'M 100 130 L 100 170')
})

test('Mermaid renders fixed coordinates and colors for empty and bought setups', async () => {
  const { JSDOM } = await import('jsdom')
  const dom = new JSDOM('<!doctype html><html><body></body></html>')
  const previousWindow = globalThis.window, previousDocument = globalThis.document, previousStyleSheet = globalThis.CSSStyleSheet
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, CSSStyleSheet: dom.window.CSSStyleSheet })
  // jsdom has no layout engine; only Mermaid's final viewport bounds need this.
  // Nodes and connectors themselves are positioned by the real grid renderer.
  dom.window.SVGElement.prototype.getBBox = () => ({ x:0, y:0, ...studyGridSize })
  try {
    const { default: mermaid } = await import('mermaid')
    mermaid.registerLayoutLoaders([studyGridLayout])
    mermaid.initialize({ startOnLoad:false, securityLevel:'strict', layout:'time-study-grid', flowchart:{htmlLabels:false,useMaxWidth:false} })
    const empty = await mermaid.render('empty-grid', studyDiagram([]))
    const bought = await mermaid.render('bought-grid', studyDiagram([11,21,31,71,121]))
    const parse = (svg: string) => new dom.window.DOMParser().parseFromString(svg, 'image/svg+xml')
    const a = parse(empty.svg), b = parse(bought.svg)
    for (const id of allStudies) {
      const selector = `[data-study-id="s${id}"]`
      assert.equal(a.querySelector(selector)?.getAttribute('transform'), b.querySelector(selector)?.getAttribute('transform'))
      const position = studyPositions[`s${id}`]
      assert.equal(a.querySelector(selector)?.getAttribute('transform'), `translate(${position.x},${position.y})`)
      assert(a.querySelector(`${selector} rect`)?.getAttribute('style')?.includes('fill:#45454f'))
    }
    assert(b.querySelector('[data-study-id="s71"] rect')?.getAttribute('style')?.includes('fill:#22aa48'))
    assert(b.querySelector('[data-study-id="s121"] text')?.getAttribute('style')?.includes('fill:#ffffff'))
    assert(b.querySelector('.study-grid-edges path')?.getAttribute('style')?.includes('stroke:#b6aabd'))
    assert.equal(a.documentElement.getAttribute('viewBox'), b.documentElement.getAttribute('viewBox'))
    assert(!b.querySelector('parsererror'))
  } finally {
    dom.window.close()
    Object.assign(globalThis, { window: previousWindow, document: previousDocument, CSSStyleSheet: previousStyleSheet })
  }
})
