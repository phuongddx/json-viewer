---
status: pending
created: 2026-03-14
slug: json-fix-compare-beautify
---

# JSON Fix Suggestions, Compare & Beautify/Minify

**Brainstorm:** [brainstorm report](../reports/brainstorm-0314-1544-json-fix-compare-beautify.md)

## Summary

Add 3 features to JSON Viewer:
1. Smart fix suggestions for invalid JSON (via `jsonrepair`)
2. Side-by-side JSON comparison (via `jsondiffpatch`)
3. Minify + Beautify toggle (replace single Format button)

## New Dependencies
- `jsonrepair` (~12KB gz, zero deps)
- `jsondiffpatch` (~15KB gz)

## Phases

| # | Phase | Status | Effort | Deps |
|---|-------|--------|--------|------|
| 1 | [Install deps + Minify/Beautify](./phase-01-minify-beautify.md) | pending | S | — |
| 2 | [Smart fix suggestions](./phase-02-fix-suggestions.md) | pending | M | P1 |
| 3 | [Side-by-side comparison](./phase-03-json-compare.md) | pending | L | P1 |

## File Ownership

| File | Phase |
|------|-------|
| `package.json` | P1 |
| `src/hooks/use-json-state.ts` | P1, P2 |
| `src/components/json-input/json-input.tsx` | P1, P2 |
| `src/components/json-input/json-input.module.css` | P1, P2 |
| `src/hooks/use-json-repair.ts` (new) | P2 |
| `src/components/json-input/fix-suggestion-banner.tsx` (new) | P2 |
| `src/App.tsx` | P3 |
| `src/App.module.css` | P3 |
| `src/components/json-compare/json-compare.tsx` (new) | P3 |
| `src/components/json-compare/diff-output.tsx` (new) | P3 |
| `src/components/json-compare/json-compare.module.css` (new) | P3 |

## Success Criteria
- Invalid JSON → fix suggestion with Apply Fix + Undo
- View|Compare tab toggle in header
- Compare mode: two inputs + color-coded semantic diff
- Minify + Beautify buttons on valid JSON
- All features work in dark + light themes
