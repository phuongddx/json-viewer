---
title: "Phase 2: Core UI - JSON Input Area & Formatting"
description: "Create JSON input component with formatting and validation"
status: completed
priority: P1
effort: 4h
branch: main
tags: [ui, json-input, formatting]
created: 2026-03-13
---

## Context

- **Depends on:** Phase 1 (Setup)
- **Purpose:** Create the JSON input area where users can paste or type JSON, with formatting and validation

---

## Overview

- **Priority:** P1
- **Current status:** completed
- **Brief description:** Build JSON input textarea with formatting (pretty-print) and validation functionality

---

## Key Insights

1. Use `JSON.stringify(data, null, 2)` for pretty-print formatting
2. Validate JSON on input using `JSON.parse()` in try-catch
3. Store parsed JSON separately from raw text for performance

---

## Requirements

### Functional
- Textarea for JSON input/paste
- Auto-format on valid JSON input
- Display validation errors for invalid JSON
- Clear button to reset input

### Non-functional
- Responsive textarea that expands with content
- Smooth error message display

---

## Architecture

```
src/
├── components/
│   └── json-input/
│       ├── json-input.tsx       # Main input component
│       └── json-input.module.css # Component styles
├── hooks/
│   └── use-json-state.ts        # JSON state management hook
```

---

## Implementation Steps

1. **Create useJsonState hook** (`src/hooks/use-json-state.ts`)
   - State: rawText, parsedData, error, isValid
   - Methods: setRawText(), formatJson(), clear()

2. **Create JsonInput component** (`src/components/json-input/json-input.tsx`)
   - Textarea for input
   - Display formatted JSON below/inside textarea
   - Error message display
   - Clear button

3. **Style component** (`src/components/json-input/json-input.module.css`)
   - Responsive textarea
   - Error state styling (red border/text)
   - Success state styling

4. **Test formatting** works with valid JSON
5. **Test error display** shows for invalid JSON

---

## File Ownership (Exclusive)

| File | Phase Owner |
|------|-------------|
| `src/components/json-input/*` | Phase 2 |
| `src/hooks/use-json-state.ts` | Phase 2 |
| `src/styles/globals.css` | Phase 1 (read only) |

---

## Todo List

- [x] Create use-json-state.ts hook
- [x] Create json-input.tsx component
- [x] Create json-input.module.css styles
- [x] Implement JSON validation
- [x] Implement pretty-print formatting
- [x] Add error display UI
- [x] Add clear button
- [x] Test with valid/invalid JSON

---

## Success Criteria

- User can paste JSON in textarea
- Valid JSON auto-formats with indentation
- Invalid JSON shows error message
- Clear button resets all state

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Large JSON causes UI lag | Medium | Debounce validation for large inputs |
| Invalid JSON crashes parse | Low | Try-catch handles gracefully |

---

## Security Considerations

- No data sent to server (client-side only)
- Sanitize error messages if displaying stack traces
