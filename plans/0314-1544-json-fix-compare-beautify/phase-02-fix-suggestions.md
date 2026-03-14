# Phase 2: Smart Fix Suggestions

**Priority:** High | **Status:** completed | **Effort:** Medium | **Depends on:** Phase 1

## Overview
When JSON input is invalid, attempt repair via `jsonrepair` and show a "Fix Available" banner with "Apply Fix" button. Apply replaces input immediately; user can undo.

## Key Insights
- `jsonrepair` handles: trailing commas, single quotes, unquoted keys, comments, missing brackets, newlines in strings, etc.
- If `jsonrepair` output === original input, no fix available (error is unfixable)
- Store previous text before applying fix for undo

## Implementation Steps

### 1. Create `src/hooks/use-json-repair.ts`
New hook that wraps `jsonrepair` logic.

```typescript
import { useMemo } from 'react'
import { jsonrepair } from 'jsonrepair'

export function useJsonRepair(rawText: string, hasError: boolean) {
  const repairResult = useMemo(() => {
    if (!hasError || !rawText.trim()) return null

    try {
      const repaired = jsonrepair(rawText)
      // Verify the repair actually produces valid JSON
      JSON.parse(repaired)
      // Only suggest if repair differs from original
      if (repaired === rawText) return null
      return { repairedText: repaired }
    } catch {
      return null // Unfixable
    }
  }, [rawText, hasError])

  return repairResult
}
```

### 2. Create `src/components/json-input/fix-suggestion-banner.tsx`
Banner shown below error message when a fix is available.

```tsx
interface FixSuggestionBannerProps {
  onApplyFix: () => void
  onUndo: () => void
  canUndo: boolean
}
```

**UI structure:**
- Yellow/amber background (using `--accent-subtle` variant or custom warning color)
- Text: "Fix available — common JSON errors detected"
- Two buttons: "Apply Fix" (primary), "Undo" (secondary, shown only when `canUndo`)

**Styling:** Add to `json-input.module.css`:
- `.fixBanner` — container with warning styling
- `.fixBannerText` — description text
- `.fixBannerActions` — button group

### 3. Update `src/components/json-input/json-input.tsx`
- Add new props: `onApplyFix`, `onUndo`, `canUndo`, `hasFixAvailable`
- Render `FixSuggestionBanner` between error container and status
- Only show banner when `error && hasFixAvailable`

### 4. Update `src/hooks/use-json-state.ts`
- Add `applyFix` function that accepts repaired text, stores current as `previousText`, sets repaired

```typescript
const applyFix = useCallback((repairedText: string) => {
  setPreviousText(rawText)
  setRawText(repairedText)
}, [rawText])
```

### 5. Wire up in `src/App.tsx`
- Import and use `useJsonRepair` hook
- Pass fix-related props to JsonInput

```tsx
const repairResult = useJsonRepair(rawText, !!error)

<JsonInput
  ...existing props
  hasFixAvailable={!!repairResult}
  onApplyFix={() => repairResult && applyFix(repairResult.repairedText)}
  onUndo={undoText}
  canUndo={previousText !== null}
/>
```

### 6. Add warning CSS variables to `globals.css`
```css
--warning: #F59E0B;
--warning-subtle: rgba(245, 158, 11, 0.12);
```
And light theme:
```css
--warning: #D97706;
--warning-subtle: rgba(217, 119, 6, 0.1);
```

### 7. Compile check
```bash
npm run build
```

## Todo
- [x] Create use-json-repair hook
- [x] Create fix-suggestion-banner component
- [x] Add warning CSS variables to globals.css
- [x] Update json-input props + render fix banner
- [x] Add applyFix to use-json-state
- [x] Wire up in App.tsx
- [x] Verify build passes

## Related Files
- `src/hooks/use-json-repair.ts` (create)
- `src/components/json-input/fix-suggestion-banner.tsx` (create)
- `src/components/json-input/json-input.tsx` (modify)
- `src/components/json-input/json-input.module.css` (modify)
- `src/hooks/use-json-state.ts` (modify)
- `src/App.tsx` (modify)
- `src/styles/globals.css` (modify)
