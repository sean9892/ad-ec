import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { readProgress, toggleCompleted } from '../src/lib/progress.ts'

const ids = ['first', 'second', 'third']
test('new, invalid, and future-version saves start cleanly', () => {
  for (const raw of [null, 'bad JSON', 'null', '42', '{"version":2}', '[]']) {
    assert.deepEqual(readProgress(raw, ids), { version: 1, completed: [], current: 'first' })
  }
})
test('restores selection and only known, unique completed objectives', () => {
  const raw = JSON.stringify({ version: 1, current: 'third', completed: ['first', 'first', 'removed', 7] })
  assert.deepEqual(readProgress(raw, ids), { version: 1, completed: ['first'], current: 'third' })
})
test('falls back to the first unfinished objective when a stored selection disappears', () => {
  assert.equal(readProgress('{"version":1,"current":"removed","completed":["first"]}', ids).current, 'second')
})
test('achieving and undoing a later step preserves every other completion', () => {
  const original = ['first']
  const achieved = toggleCompleted(original, 'third')
  assert.deepEqual(achieved, ['first', 'third'])
  assert.deepEqual(toggleCompleted(achieved, 'third'), original)
  assert.deepEqual(original, ['first'])
})
test('completion and selection survive a save and reload round trip', () => {
  const state = { version: 1 as const, completed: toggleCompleted(['first'], 'second'), current: 'second' }
  assert.deepEqual(readProgress(JSON.stringify(state), ids), state)
})
test('the imported guide includes 164 unique objectives and all 60 challenge completions', () => {
  const { objectives } = JSON.parse(readFileSync(new URL('../src/data/objectives.json', import.meta.url), 'utf8'))
  assert.equal(objectives.length, 164)
  assert.equal(new Set(objectives.map((o: {id: string}) => o.id)).size, 164)
  for (let ec = 1; ec <= 12; ec++) for (let completion = 1; completion <= 5; completion++) {
    assert.equal(objectives.filter((o: {challenge?: string}) => o.challenge === `EC${ec}x${completion}`).length, 1)
  }
  for (const objective of objectives) {
    assert.ok(objective.title && objective.description && objective.source.sheet && objective.source.row)
    if (objective.challenge) assert.match(objective.studies, /^\d+(,\d+)*\|\d+$/)
  }
})
