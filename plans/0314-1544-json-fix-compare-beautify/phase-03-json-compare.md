# Phase 3: Side-by-Side JSON Comparison

**Priority:** Medium | **Status:** completed | **Effort:** Large | **Depends on:** Phase 1

## Overview
Add View|Compare tab toggle in header. Compare mode replaces the sidebar+viewer layout with two side-by-side JSON input panels and a semantic diff output below.

## Key Insights
- `jsondiffpatch` provides `diff()` for semantic comparison and `formatters.html.format()` for HTML output
- Need to import jsondiffpatch CSS or override with our theme variables
- Reuse `JsonInput` component (without fix suggestions) for both panels
- Diff only computed when both inputs contain valid JSON

## Implementation Steps

### 1. Create `src/hooks/use-json-compare.ts`
Hook managing two JSON states + diff computation.

```typescript
import { useState, useCallback, useMemo } from 'react'
import * as jsondiffpatch from 'jsondiffpatch'

export function useJsonCompare() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')

  const leftParsed = useMemo(() => {
    try { return { data: JSON.parse(leftText), error: null } }
    catch (e) { return { data: null, error: e instanceof Error ? e.message : 'Invalid JSON' } }
  }, [leftText])

  const rightParsed = useMemo(() => {
    try { return { data: JSON.parse(rightText), error: null } }
    catch (e) { return { data: null, error: e instanceof Error ? e.message : 'Invalid JSON' } }
  }, [rightText])

  const diff = useMemo(() => {
    if (!leftParsed.data || !rightParsed.data) return null
    return jsondiffpatch.diff(leftParsed.data, rightParsed.data)
  }, [leftParsed.data, rightParsed.data])

  const diffHtml = useMemo(() => {
    if (!leftParsed.data) return null
    // Format with left as base
    return jsondiffpatch.formatters.html.format(
      diff ?? undefined,
      leftParsed.data
    )
  }, [diff, leftParsed.data])

  const isIdentical = diff === undefined && leftParsed.data && rightParsed.data
  const hasBothValid = !!leftParsed.data && !!rightParsed.data

  return {
    leftText, setLeftText,
    rightText, setRightText,
    leftError: leftText.trim() ? leftParsed.error : null,
    rightError: rightText.trim() ? rightParsed.error : null,
    diffHtml,
    isIdentical,
    hasBothValid,
  }
}
```

### 2. Create `src/components/json-compare/diff-output.tsx`
Renders the jsondiffpatch HTML output with theme-aware styling.

```tsx
interface DiffOutputProps {
  diffHtml: string | null
  isIdentical: boolean
  hasBothValid: boolean
}
```

**States:**
- Neither input valid: "Enter valid JSON in both panels"
- Both valid + identical: "JSONs are identical" (green)
- Both valid + different: render `diffHtml` via `dangerouslySetInnerHTML`
- Note: `dangerouslySetInnerHTML` is safe here because `jsondiffpatch` generates the HTML from parsed JSON data, not from raw user input

### 3. Create `src/components/json-compare/json-compare.tsx`
Container for compare mode.

```
┌─────────────────────────────────┐
│  [Left Panel]  │  [Right Panel] │  ← two JsonInput instances
├─────────────────────────────────┤
│          Diff Output            │  ← DiffOutput component
└─────────────────────────────────┘
```

- Uses `useJsonCompare` hook
- Renders two `JsonInput` components side by side (without fix suggestion props)
- Renders `DiffOutput` below
- Each panel has its own "Beautify" + "Minify" + "Clear" buttons

### 4. Create `src/components/json-compare/json-compare.module.css`
```css
.container — flex column, full height
.panels — flex row, two equal panels, gap
.panel — flex: 1, min-width: 0
.diffSection — flex-shrink: 0, max-height: 50%

/* Override jsondiffpatch HTML output colors for our theme */
.diffSection :global(.jsondiffpatch-added) { background: var(--success-subtle) }
.diffSection :global(.jsondiffpatch-deleted) { background: var(--error-subtle) }
.diffSection :global(.jsondiffpatch-modified) { background: var(--warning-subtle) }
/* ... additional jsondiffpatch overrides */
```

**Responsive:** Stack panels vertically on mobile (`@media max-width: 768px`)

### 5. Update `src/App.tsx`
- Add `mode` state: `'view' | 'compare'`
- Add tab toggle buttons in header (between title and theme button)
- Conditionally render sidebar+main (view mode) or JsonCompare (compare mode)

```tsx
const [mode, setMode] = useState<'view' | 'compare'>('view')

// In header:
<div className={styles.modeTabs}>
  <button
    className={`${styles.modeTab} ${mode === 'view' ? styles.modeTabActive : ''}`}
    onClick={() => setMode('view')}
  >View</button>
  <button
    className={`${styles.modeTab} ${mode === 'compare' ? styles.modeTabActive : ''}`}
    onClick={() => setMode('compare')}
  >Compare</button>
</div>

// In Layout main prop:
{mode === 'view' ? (
  <Layout header={header} sidebar={sidebar} main={main} />
) : (
  <Layout header={header} sidebar={null} main={<JsonCompare />} />
)}
```

Actually, rethinking Layout usage — for compare mode we don't need sidebar. Better approach:
- In compare mode, pass `sidebar={null}` or handle in Layout
- Or bypass Layout entirely for compare mode and use full-width

**Simpler approach:** Always use Layout. In compare mode, hide sidebar and make main full-width.

Update `Layout` to accept optional sidebar:
```tsx
// If sidebar is null, main takes full width
{sidebar && (
  <aside className={styles.sidebar}>{sidebar}</aside>
)}
<main className={`${styles.main} ${!sidebar ? styles.mainFull : ''}`}>
  {main}
</main>
```

### 6. Update `src/App.module.css`
Add mode tab styles:
```css
.modeTabs — flex, gap: 2px, background: var(--bg-elevated), border-radius, padding: 2px
.modeTab — padding, font-size: 12px, border: none, background: transparent, cursor: pointer
.modeTabActive — background: var(--accent), color: white, border-radius
```

### 7. Update `src/components/layout/layout.tsx` and `layout.module.css`
- Make sidebar optional (already typed as required in LayoutProps)
- Add `.mainFull` class for when sidebar is null

### 8. Compile check
```bash
npm run build
```

## Todo
- [x] Create use-json-compare hook
- [x] Create diff-output component
- [x] Create json-compare container component
- [x] Create json-compare.module.css with jsondiffpatch overrides
- [x] Add mode state + tab toggle to App.tsx
- [x] Add mode tab styles to App.module.css
- [x] Update Layout to support optional sidebar
- [x] Verify build passes
- [x] Test dark + light theme

## Related Files
- `src/hooks/use-json-compare.ts` (create)
- `src/components/json-compare/json-compare.tsx` (create)
- `src/components/json-compare/diff-output.tsx` (create)
- `src/components/json-compare/json-compare.module.css` (create)
- `src/App.tsx` (modify)
- `src/App.module.css` (modify)
- `src/components/layout/layout.tsx` (modify)
- `src/components/layout/layout.module.css` (modify)
