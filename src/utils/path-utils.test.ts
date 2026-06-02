import { describe, it, expect } from 'vitest'
import { pathToString } from './path-utils'

describe('pathToString', () => {
  it('returns "root" for empty path', () => {
    expect(pathToString([])).toBe('root')
  })

  it('handles a single string segment', () => {
    expect(pathToString(['name'])).toBe('root.name')
  })

  it('handles nested string segments', () => {
    expect(pathToString(['author', 'name'])).toBe('root.author.name')
  })

  it('handles numeric index for arrays', () => {
    expect(pathToString(['items', 0])).toBe('root.items[0]')
  })

  it('handles nested array and object paths', () => {
    expect(pathToString(['items', 0, 'id'])).toBe('root.items[0].id')
  })

  it('handles deeply nested mixed paths', () => {
    expect(pathToString(['a', 'b', 2, 'c', 3])).toBe('root.a.b[2].c[3]')
  })
})
