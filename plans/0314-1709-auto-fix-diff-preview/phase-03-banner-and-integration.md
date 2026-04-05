# Phase 03: Banner Update & Integration

**Status:** Complete
**Priority:** High
**Depends on:** Phase 01, Phase 02

## Overview

Wire the diff preview into the existing fix suggestion flow by updating the banner, JsonInput, and App.tsx.

## Changes

### `fix-suggestion-banner.tsx`

Add `showDiff`, `onToggleDiff`, `originalText`, `repairedText` props.
Render "Preview" toggle button + `<FixDiffPreview>` when `showDiff === true`.

```typescript
interface FixSuggestionBannerProps {
  onApplyFix: () => void
  onUndo: () => void
  canUndo: boolean
  // new:
  originalText: string
  repairedText: string
  showDiff: boolean
  onToggleDiff: () => void
}
```

Button order: `[Preview Fix / Hide Diff]  [Apply Fix]  [Undo]`

### `json-input.tsx`

Add optional props:
```typescript
fixOriginalText?: string
fixRepairedText?: string
showFixDiff?: boolean
onToggleFixDiff?: () => void
```
Pass through to `FixSuggestionBanner`.

### `App.tsx`

Add `showFixDiff` state (`useState(false)`).
Pass to `JsonInput`:
```tsx
fixOriginalText={rawText}
fixRepairedText={repairResult?.repairedText ?? ''}
showFixDiff={showFixDiff}
onToggleFixDiff={() => setShowFixDiff(v => !v)}
```
Reset `showFixDiff` to `false` when fix is applied or input changes.

## Reset Logic
<!-- Updated: Validation Session 1 - Close diff on Undo for cleaner UX -->

- `applyFix` → reset `showFixDiff = false`
- `undoText` → reset `showFixDiff = false` (cleaner UX — avoids stale diff after undo)
- `clearAll` → reset `showFixDiff = false`
- `updateText` (user types) → reset `showFixDiff = false` (stale diff)

## Related Code Files

- **Modify:** `src/components/json-input/fix-suggestion-banner.tsx`
- **Modify:** `src/components/json-input/json-input.tsx`
- **Modify:** `src/App.tsx`

## Success Criteria

- "Preview Fix" button appears in banner when fix available
- Clicking toggles diff panel open/closed
- Diff panel hides after applying fix
- No regressions in compare mode (JsonInput used there without fix props)
- Undo still works after previewing
