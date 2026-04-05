# Phase 01: Text Diff Utility

**Status:** Complete
**Priority:** High (blocks Phase 02)

## Overview

Create `src/utils/text-diff.ts` — a lightweight LCS-based line diff utility. No new dependencies.

## Requirements

- Input: two strings (original, modified)
- Output: `DiffLine[]` with `type: 'add' | 'remove' | 'unchanged'` and `text: string`
- Return full diff array (no built-in cap — display truncation handled by the component at 150 lines)
<!-- Updated: Validation Session 1 - Truncation limit: 150 lines enforced in component only, utility returns full array -->

## Implementation Steps

1. Split both strings by `\n`
2. Compute LCS (Longest Common Subsequence) on line arrays
3. Backtrack to produce diff lines
4. Export `diffLines(original: string, modified: string): DiffLine[]`

## Code Sketch

```typescript
export type DiffLine = { type: 'add' | 'remove' | 'unchanged'; text: string }

export function diffLines(original: string, modified: string): DiffLine[] {
  const a = original.split('\n')
  const b = modified.split('\n')
  // LCS DP table
  const dp = ...
  // Backtrack to build result
}
```

## Related Code Files

- **Create:** `src/utils/text-diff.ts`
- **Create:** `src/utils/text-diff.test.ts`

## Unit Tests
<!-- Updated: Validation Session 1 - Add unit tests for diffLines utility -->

```typescript
// src/utils/text-diff.test.ts
import { diffLines } from './text-diff'

test('identical strings → all unchanged', () => {
  const result = diffLines('{"a":1}', '{"a":1}')
  expect(result.every(l => l.type === 'unchanged')).toBe(true)
})

test('trailing comma removed → remove + add lines', () => {
  const result = diffLines('{"a":1,}', '{"a":1}')
  expect(result.some(l => l.type === 'remove')).toBe(true)
  expect(result.some(l => l.type === 'add')).toBe(true)
})

test('empty strings → empty result', () => {
  expect(diffLines('', '')).toEqual([{ type: 'unchanged', text: '' }])
})
```

## Success Criteria

- `diffLines('{"a":1}', '{"a":1}')` → all unchanged
- `diffLines('{"a":1,}', '{"a":1}')` → remove trailing comma line, add clean line
- Unit tests pass
