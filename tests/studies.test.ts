import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { connections, parseStudies, studyDiagram, studyRoutes } from '../src/lib/studies.ts'
const guide=JSON.parse(readFileSync(new URL('../src/data/objectives.json',import.meta.url),'utf8'))
const early=JSON.parse(readFileSync(new URL('../src/data/early-studies.json',import.meta.url),'utf8'))
test('early trees carry forward purchases and remove respecced studies',()=>{
 assert.deepEqual(early['eternity-10'].studies,[])
 assert.deepEqual(early['eternity-22'].added,[51])
 assert.deepEqual(early['eternity-23'].added,[61])
 assert(early['eternity-40'].studies.includes(33))
 assert(!early['eternity-43'].studies.includes(71))
 assert(early['eternity-43'].studies.includes(72))
 assert(!early['eternity-69'].studies.includes(33))
 assert.deepEqual(early['eternity-85'].added,[41])
 assert.equal(Object.keys(early).length,56)
})
test('routes include both selected resource paths and ignore EC import suffix',()=>{
 assert.deepEqual(studyRoutes(parseStudies('11,71,73,121,131,141|12')),{Resource:['Antimatter','Time'],Activeness:['Active']})
 assert.deepEqual(studyRoutes([11,22]),{Resource:['None'],Activeness:['None']})
 assert.deepEqual(studyRoutes([72,123]),{Resource:['Infinity'],Activeness:['Idle']})
})
test('all guide setups use known study nodes and all challenge setups are present',()=>{
 const known=new Set(connections.flat())
 for(const o of guide.objectives){
  const studies=early[o.id]?.studies ?? parseStudies(o.studies)
  if(o.kind==='challenge') assert(studies.length>0,o.id)
  for(const id of studies) assert(known.has(id),`${o.id}: unknown TS${id}`)
  assert(studies.filter((id:number)=>id>=221&&id<=228).length<=5)
 }
})
test('diagram includes new nodes, real branches and the EC10 gate',()=>{
 const source=studyDiagram([11,21,22,31,32,181,191],[31])
 assert(source.includes('s31["TS31 · NEW"]'))
 assert(source.includes('s21 --> s31'))
 assert(source.includes('s181 --> ec10'))
 assert(source.includes('ec10 --> s191'))
 assert(!source.includes('s181 --> s191'))
})
