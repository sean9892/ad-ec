import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { allStudies, connections, parseStudies, studyDiagram, studyRoutes } from '../src/lib/studies.ts'
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
test('full tree retains unbought branches and uses plain study labels',()=>{
 const source=studyDiagram([11,21,31,181,191])
 for (const id of allStudies) assert(source.includes(`s${id}["TS${id}"]`))
 assert(!source.includes('NEW'))
 assert(source.includes('style s22 fill:#45454f'))
 assert(source.includes('style s31 fill:#46bdc6'))
 assert(source.includes('s21 --> s31'))
 assert(source.includes('s181 --> ec10'))
 assert(source.includes('ec10 --> s191'))
 assert(!source.includes('s181 --> s191'))
 const empty=studyDiagram([])
 for (const id of allStudies) assert(empty.includes(`style s${id} fill:#45454f`))
})
