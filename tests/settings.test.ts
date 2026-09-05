import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readSettings, SETTINGS_KEY } from '../src/lib/settings.ts'
import { nextAfterAchievement, STORAGE_KEY } from '../src/lib/progress.ts'

test('automatic advance defaults on for absent, invalid, or unsupported settings', () => {
  for (const raw of [null, 'bad JSON', 'null', '[]', '42', '{"version":2,"autoAdvance":false}', '{"version":1,"autoAdvance":"false"}']) {
    assert.deepEqual(readSettings(raw), { version: 1, autoAdvance: true })
  }
})
test('both switch states survive a save and reload independently of progress', () => {
  for (const autoAdvance of [true, false]) {
    assert.equal(readSettings(JSON.stringify({ version: 1, autoAdvance })).autoAdvance, autoAdvance)
  }
  assert.notEqual(SETTINGS_KEY, STORAGE_KEY)
})
test('achievement advances exactly one step; undo, opt-out, and the final step stay put', () => {
  assert.equal(nextAfterAchievement(0, 3, false, true), 1)
  assert.equal(nextAfterAchievement(1, 3, false, true), 2)
  assert.equal(nextAfterAchievement(0, 3, true, true), null)
  assert.equal(nextAfterAchievement(0, 3, false, false), null)
  assert.equal(nextAfterAchievement(2, 3, false, true), null)
  assert.equal(nextAfterAchievement(0, 1, false, true), null)
})
