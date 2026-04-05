import { describe, test, expect } from 'vitest'
import { diffLines } from './text-diff'

describe('diffLines', () => {
  test('identical strings → all unchanged', () => {
    const result = diffLines('{"a":1}', '{"a":1}')
    expect(result.every(l => l.type === 'unchanged')).toBe(true)
  })

  test('trailing comma removed → has remove and add lines', () => {
    const result = diffLines('{"a":1,}', '{"a":1}')
    expect(result.some(l => l.type === 'remove')).toBe(true)
    expect(result.some(l => l.type === 'add')).toBe(true)
  })

  test('empty strings → single unchanged empty line', () => {
    expect(diffLines('', '')).toEqual([{ type: 'unchanged', text: '' }])
  })

  test('added line → has add type with correct text', () => {
    const result = diffLines('line1', 'line1\nline2')
    expect(result.some(l => l.type === 'add' && l.text === 'line2')).toBe(true)
  })

  test('removed line → has remove type with correct text', () => {
    const result = diffLines('line1\nline2', 'line1')
    expect(result.some(l => l.type === 'remove' && l.text === 'line2')).toBe(true)
  })

  test('completely different strings → only add and remove', () => {
    const result = diffLines('foo', 'bar')
    expect(result.some(l => l.type === 'remove' && l.text === 'foo')).toBe(true)
    expect(result.some(l => l.type === 'add' && l.text === 'bar')).toBe(true)
    expect(result.every(l => l.type !== 'unchanged')).toBe(true)
  })
})
