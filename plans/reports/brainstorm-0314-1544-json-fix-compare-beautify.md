# Brainstorm: JSON Fix Suggestions, Compare & Beautify/Minify

**Date:** 2026-03-14
**Status:** Agreed

## Problem Statement
JSON Viewer needs 3 new features:
1. Smart fix suggestions when JSON input is invalid
2. Side-by-side JSON comparison
3. Minify + Beautify toggle (replacing single Format button)

## Requirements (from user)
- Fix suggestions: detect common errors, show "Apply Fix" button, auto-replace with undo
- Compare: tab toggle (View | Compare) in header, two input panels + diff output below
- Beautify/Minify: two separate buttons replacing current "Format"

## Evaluated Approaches

### Feature 1: Smart Fix Suggestions

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **`jsonrepair` library** | Handles 20+ error types, battle-tested, ~12KB, zero deps | External dep; may produce unexpected output | **Selected** |
| Custom regex detection | No deps | Fragile, limited coverage, hard to maintain | Rejected |
| Custom parser w/ error recovery | Full control | Significant effort, reinventing the wheel | Rejected |

**UX Flow:**
1. Invalid JSON → error shown
2. `jsonrepair` attempts repair
3. If repairable → "Fix Available" + Apply Fix button
4. Click → auto-replace, store previous for Undo

### Feature 2: Side-by-Side Comparison

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| **`jsondiffpatch`** | Semantic JSON diff, built-in HTML formatter, ~15KB | Needs custom CSS for theme | **Selected** |
| `jsdiff` (text-based) | Simple | Not JSON-aware, formatting noise | Rejected |
| Monaco editor diff | Rich editor | ~2MB, massive overkill | Rejected |
| Custom recursive diff | Full control | Significant effort | Rejected |

**Layout:**
- Tab toggle "View | Compare" in header
- Compare mode: two input textareas side-by-side + diff output below
- Both panels parse independently; diff computed when both valid

### Feature 3: Minify + Beautify

No new dependencies needed.
- Beautify: `JSON.stringify(parsed, null, 2)` (existing behavior)
- Minify: `JSON.stringify(parsed)` (new)
- Replace single "Format" button with "Beautify" + "Minify"

## New Dependencies
- `jsonrepair` (~12KB gzipped, zero deps)
- `jsondiffpatch` (~15KB gzipped)

## Component Architecture

```
App
├── Header (+ View|Compare tab toggle)
├── [View Mode]
│   ├── Sidebar
│   │   ├── JsonInput (+ fix suggestion banner + undo)
│   │   └── FileDropZone
│   └── Main → JsonViewerComponent
└── [Compare Mode]
    ├── Left panel (JsonInput reused)
    ├── Right panel (JsonInput reused)
    └── DiffOutput (jsondiffpatch HTML)
```

## New Files (estimated)
- `src/components/json-compare/json-compare.tsx` — compare mode container
- `src/components/json-compare/diff-output.tsx` — diff visualization
- `src/components/json-compare/json-compare.module.css`
- `src/components/json-input/fix-suggestion-banner.tsx` — fix suggestion UI
- `src/hooks/use-json-repair.ts` — jsonrepair integration

## Modified Files
- `src/App.tsx` — add mode toggle, render compare mode
- `src/App.module.css` — compare layout styles
- `src/components/json-input/json-input.tsx` — add fix suggestion + minify/beautify
- `src/components/json-input/json-input.module.css` — styles for fix banner
- `src/hooks/use-json-state.ts` — add minify function, undo support
- `package.json` — add jsonrepair, jsondiffpatch

## Risks & Mitigations
| Risk | Mitigation |
|------|-----------|
| `jsonrepair` unexpected output | Show what changed after apply; undo available |
| Compare layout cramped on mobile | Hide compare tab on small screens or stack vertically |
| `jsondiffpatch` HTML needs theme styling | Override default styles with CSS variables |

## Success Criteria
- Invalid JSON shows specific fix suggestion with Apply Fix button
- Apply Fix replaces input; Undo reverts to previous
- View|Compare tab toggle switches layout
- Compare mode shows semantic diff (additions/deletions/changes color-coded)
- Minify + Beautify buttons both work on valid JSON
- All features work in both dark and light themes

## Next Steps
Create detailed implementation plan with phased approach.
