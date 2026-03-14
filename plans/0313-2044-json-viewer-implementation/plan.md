---
title: "JSON Viewer Web Application Implementation"
description: "Clone of jsonviewer.stack.hu with JSON input, formatting, syntax highlighting, and file import support"
status: completed
priority: P1
effort: 16h
branch: main
tags: [json-viewer, react, vite, typescript, web-app]
created: 2026-03-13
---

## Overview

Build a client-side JSON viewer web application that replicates jsonviewer.stack.hu functionality with modern React + TypeScript stack.

## Key Decisions

- **Stack:** Vite + React 18 + TypeScript
- **JSON Viewer:** `@textea/json-viewer` (~80KB, feature-rich interactive tree view)
- **File Import:** Custom `useFileImport` hook using FileReader API, Drag & Drop, Clipboard APIs
- **No server-side storage:** All processing client-side
- **HTTPS ready:** Uses standard browser APIs
- **Theme:** Light/Dark toggle support

## Phase Status

| Phase | Status | Effort |
|-------|--------|--------|
| 1. Setup | completed | 2h |
| 2. Core UI | completed | 4h |
| 3. JSON Viewer | completed | 3h |
| 4. File Import | completed | 4h |
| 5. Integration & Polish | completed | 3h |

---

## Dependency Matrix

```
Phase 1 (Setup) ─────────┐
                         │
Phase 2 (Core UI) ───────┼──> Phase 5 (Integration)
                         │
Phase 3 (JSON Viewer) ───┘
                         │
Phase 4 (File Import) ────┘
```

- **Sequential:** Phase 1 → Phase 2, 3, 4 can run in parallel after Phase 1
- **Parallel:** Phases 2, 3, 4 are independent and can be implemented concurrently
- **Final:** Phase 5 depends on all previous phases

---

## File Ownership Matrix

| Phase | Files Owned |
|-------|-------------|
| 1. Setup | `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts` |
| 2. Core UI | `src/components/json-input/` (all files), `src/hooks/use-json-state.ts`, `src/styles/globals.css` |
| 3. JSON Viewer | `src/components/json-viewer/` (all files), `src/components/toolbar/` (all files) |
| 4. File Import | `src/hooks/use-file-import.ts`, `src/components/file-drop-zone/` (all files) |
| 5. Integration | `src/App.tsx` (final), `src/components/layout/` (all files), `vite.config.ts` (if HTTPS) |

---

## Phase 1: Setup (2h)

### Files to Create
```
package.json
tsconfig.json
vite.config.ts
index.html
src/main.tsx
src/App.tsx
src/vite-env.d.ts
src/styles/globals.css
```

### Implementation Steps
1. Initialize Vite + React + TypeScript project
2. Configure TypeScript compiler options
3. Set up Vite with React plugin
4. Create basic App component structure
5. Add global styles

### Dependencies
- `react`, `react-dom` (^18)
- `react-json-view-lite` (^2.5)
- `@types/react`, `@types/react-dom`
- `typescript`, `vite`, `@vitejs/plugin-react`

### Success Criteria
- Project builds without errors
- Dev server runs on localhost

---

## Phase 2: Core UI (4h)

### Files to Create
```
src/components/json-input/json-input.tsx
src/components/json-input/json-input.module.css
src/hooks/use-json-state.ts
```

### Implementation Steps
1. Create JSON input text area component
2. Add JSON formatting/pretty-print functionality (using `JSON.stringify(data, null, 2)`)
3. Create `useJsonState` hook for managing JSON state
4. Add error handling for invalid JSON
5. Style input area

### Dependencies
- Phase 1 complete

### Success Criteria
- User can paste/type JSON in input area
- JSON is validated and formatted on input
- Error messages displayed for invalid JSON

---

## Phase 3: JSON Viewer (3h)

### Files to Create
```
src/components/json-viewer/json-viewer-component.tsx
src/components/json-viewer/json-viewer.module.css
src/components/toolbar/toolbar.tsx
src/components/toolbar/toolbar.module.css
```

### Implementation Steps
1. Integrate `react-json-view-lite` for tree view display
2. Add expand/collapse controls
3. Create toolbar with:
   - Copy to clipboard button
   - Expand/Collapse all
   - Theme toggle (light/dark)
4. Style viewer component

### Dependencies
- Phase 1 complete

### Success Criteria
- JSON displays as interactive tree with syntax highlighting
- Expand/collapse nodes work
- Copy to clipboard functional

---

## Phase 4: File Import (4h)

### Files to Create
```
src/hooks/use-file-import.ts
src/components/file-drop-zone/file-drop-zone.tsx
src/components/file-drop-zone/file-drop-zone.module.css
```

### Implementation Steps
1. Create `useFileImport` hook supporting:
   - File input (file picker)
   - Drag and drop
   - Clipboard paste
2. Create DropZone component with visual feedback
3. Handle file validation (.json files only)
4. Parse and validate JSON from each source

### Key Implementation Details
- FileReader API for reading file contents
- Drag events: `dragover` (preventDefault required), `drop`
- Clipboard: handle both text paste and file paste
- Unified interface: `loadFromFile()`, `loadFromText()`, `loadFromDrop()`, `loadFromPaste()`

### Dependencies
- Phase 1 complete

### Success Criteria
- File picker opens and loads JSON files
- Drag & drop works on drop zone
- Paste (Ctrl+V) loads JSON from clipboard

---

## Phase 5: Integration & Polish (3h)

### Files to Modify/Create
```
src/App.tsx (integrate all components)
src/components/layout/layout.tsx
src/components/layout/layout.module.css
vite.config.ts (HTTPS configuration)
```

### Implementation Steps
1. Integrate all components in App.tsx
2. Create responsive layout with input/viewer split view
3. Add toggle between input and viewer modes
4. Polish styling and user experience
5. Configure HTTPS for production (if needed)
6. Test all features end-to-end

### Dependencies
- Phases 2, 3, 4 complete

### Success Criteria
- Full workflow: import → view → interact works
- Responsive on desktop and mobile
- No console errors
- HTTPS ready

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Large JSON files cause performance issues | Medium | react-json-view-lite handles virtualization; add size limit warning |
| Clipboard API requires HTTPS | Low | Use HTTPS in production; warn users on HTTP |
| Invalid JSON crashes app | Low | Try-catch and error display already in plan |

---

## Validation Log

### Session 1 (2026-03-13)
| Question | Answer |
|----------|--------|
| JSON viewing library | @textea/json-viewer (feature-rich) |
| File size limit | No limit |
| Theme support | Light/Dark toggle |

---

## Next Steps

1. Start Phase 1: Setup
2. Run in parallel: Phases 2, 3, 4
3. Complete Phase 5: Integration
