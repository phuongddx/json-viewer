# Phase 02: Fix Diff Preview Component

**Status:** Complete
**Priority:** High (blocks Phase 03)
**Depends on:** Phase 01

## Overview

Create `src/components/json-input/fix-diff-preview.tsx` — renders the line-by-line diff between original and repaired JSON.

## Requirements

- Show removed lines in red with `−` prefix
- Show added lines in green with `+` prefix
- Show unchanged lines in muted color
- Monospace font (Fira Code, matching textarea)
- Scrollable container with max-height (avoid layout overflow)
- Truncate at 150 lines with "…X more lines" indicator

## Component Interface

```typescript
interface FixDiffPreviewProps {
  originalText: string
  repairedText: string
}
```

## Styling (fix-diff-preview.module.css)
<!-- Updated: Validation Session 1 - Own CSS module instead of json-input.module.css -->

```css
/* src/components/json-input/fix-diff-preview.module.css */
.diffPreview { /* scrollable container, max-height: 240px, border */ }
.diffLine { /* flex row, font monospace 12px */ }
.diffLineRemove { /* color: var(--error), bg: var(--error-subtle) */ }
.diffLineAdd    { /* color: var(--success), bg: var(--success-subtle) */ }
.diffLineUnchanged { /* color: var(--text-muted) */ }
.diffLinePrefix { /* fixed width 16px, mr 8px, user-select: none */ }
```

## Related Code Files

- **Create:** `src/components/json-input/fix-diff-preview.tsx`
- **Create:** `src/components/json-input/fix-diff-preview.module.css`

## Success Criteria

- Renders correctly for small and large JSON
- No layout overflow (scrollable)
- Accessible (aria-label on container)
