import { test } from 'node:test'
import assert from 'node:assert/strict'
import { formatAmount, resourceSegments } from '../src/lib/resources.ts'

test('keeps scientific notation, units and separate TT purchases intact', () => {
  const parts = resourceSegments('Get e120,000AM, e600IP and 8EP TT = 17TT.')
  assert.deepEqual(parts.filter(p => p.type === 'resource').map(p => p.requirement), [
    { amount: 'e120,000', resource: 'AM' }, { amount: 'e600', resource: 'IP' },
    { amount: '8', resource: 'EP' }, { amount: '17', resource: 'TT' },
  ])
})
test('recognizes lowercase units, alternate targets and minimum qualifiers', () => {
  const parts = resourceSegments('e3590ip; 160 or 163TT; 830TT+; <100EP; 1.44e17EP')
  assert.deepEqual(parts.filter(p => p.type === 'resource').map(p => p.requirement.amount), ['e3590', '160 or 163', '830+', '<100', '1.44e17'])
})
test('does not turn EP multipliers or farming rates into resource requirements', () => {
  const text = 'Buy x5EP or ×5 EP, then improve 10EP/min.'
  assert.deepEqual(resourceSegments(text), [{ type: 'text', text }])
  assert.equal(formatAmount('1.44e17'), '1.44e17')
  assert.equal(formatAmount('12350+'), '12,350+')
  assert.equal(formatAmount('e120,000'), 'e120,000')
})
