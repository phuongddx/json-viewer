# Plan: Auto-Fix Diff Preview Enhancement

**Date:** 2026-03-14
**Status:** Complete
**Priority:** Medium

## Goal

Enhance the existing JSON auto-fix feature so users can preview a line-by-line diff between the original (invalid) JSON and the repaired version before applying the fix.

## Current State

- `useJsonRepair` hook detects fixable JSON errors via `jsonrepair`
- `FixSuggestionBanner` shows a banner with "Apply Fix" / "Undo" buttons
- No preview of what changes would be made

## Target State

- "Preview Fix" toggle button in the banner
- Expandable diff panel showing line-level diff (red = removed, green = added)
- Users can review changes before applying

## Phases

| Phase | File(s) | Status |
|-------|---------|--------|
| [Phase 01](./phase-01-text-diff-utility.md) | `src/utils/text-diff.ts` | Complete |
| [Phase 02](./phase-02-fix-diff-preview-component.md) | `fix-diff-preview.tsx` + CSS | Complete |
| [Phase 03](./phase-03-banner-and-integration.md) | `fix-suggestion-banner.tsx`, `json-input.tsx`, `App.tsx` | Complete |

## Key Dependencies

- No new npm packages — implement LCS-based line diff natively
- `jsondiffpatch` already installed (for JSON compare mode) — not suitable here (needs valid JSON on both sides)
- `jsonrepair` already installed — continues to power the repair

## Validation Log

### Session 1 — 2026-03-14
**Trigger:** Pre-implementation validation via `/plan validate`
**Questions asked:** 4

#### Questions & Answers

1. **[Architecture]** Phase 01 mentions truncating at 200 lines, but Phase 02's component truncates at 150 lines. Which limit should be canonical?
   - Options: 150 lines | 200 lines | Configurable prop
   - **Answer:** 150 lines — enforced in component only; utility returns full array

2. **[Architecture]** Should fix-diff-preview.tsx have its own CSS module, or add its styles to the existing json-input.module.css?
   - Options: Own module | Shared json-input.module.css
   - **Answer:** Own module — `fix-diff-preview.module.css`

3. **[Assumptions]** After clicking Undo, the plan keeps showFixDiff open. Is this the desired UX?
   - Options: Keep open | Close on Undo
   - **Answer:** Close on Undo — reset `showFixDiff=false` same as apply/clear

4. **[Scope]** Should we add unit tests for the diffLines utility as part of this plan?
   - Options: Yes, add to Phase 01 | No, skip tests
   - **Answer:** Yes — add unit tests to Phase 01

#### Confirmed Decisions
- Truncation: 150-line cap in component; utility returns full array
- CSS: `fix-diff-preview.module.css` (own module)
- Undo resets diff panel closed
- Unit tests for `diffLines` added to Phase 01

#### Action Items
- [x] Phase 01: Remove 200-line cap from utility; add unit test file
- [x] Phase 02: Change CSS file to `fix-diff-preview.module.css`
- [x] Phase 03: Reset `showFixDiff=false` on `undoText`

#### Impact on Phases
- Phase 01: Utility returns full array; new `text-diff.test.ts` file added
- Phase 02: New CSS module `fix-diff-preview.module.css` instead of shared file
- Phase 03: Undo reset logic updated

---

## Architecture

```
App.tsx
  rawText + repairResult.repairedText
    → JsonInput (adds originalText + fixPreviewText props)
      → FixSuggestionBanner (adds onToggleDiff + showDiff + originalText + repairedText)
        → FixDiffPreview (new component, renders diff lines)
              ↑
        text-diff.ts utility (diffLines function)
```
