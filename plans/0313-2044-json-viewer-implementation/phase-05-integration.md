---
title: "Phase 5: Integration & Polish"
description: "Integrate all components into final application with responsive layout"
status: completed
priority: P1
effort: 3h
branch: main
tags: [integration, polish, responsive]
created: 2026-03-13
---

## Context

- **Depends on:** Phases 2, 3, 4 (all previous phases)
- **Purpose:** Combine all components into final app, polish UI/UX

---

## Overview

- **Priority:** P1
- **Current status:** completed
- **Brief description:** Integrate JSON input, viewer, file import into unified app with responsive split-view layout

---

## Key Insights

1. Use split-pane or tab layout: input on left/top, viewer on right/bottom
2. Toggle between input and viewer modes
3. Responsive: side-by-side on desktop, stacked on mobile

---

## Requirements

### Functional
- Unified layout combining all components
- Toggle between input mode and viewer mode
- File import populates viewer directly
- Keyboard shortcuts (Ctrl+V for paste)

### Non-functional
- Responsive design (desktop + mobile)
- Smooth transitions between modes
- No console errors
- HTTPS ready

---

## Architecture

```
src/
├── components/
│   └── layout/
│       ├── layout.tsx              # Main layout component
│       └── layout.module.css       # Layout styles
└── App.tsx                        # Final integration (update)
```

---

## Implementation Steps

1. **Update App.tsx** - Integrate all components
   - Import JsonInput, JsonViewer, Toolbar, FileDropZone
   - Manage state: currentMode ('input' | 'view'), jsonData
   - Wire up file import to auto-switch to view mode

2. **Create Layout component** (`src/components/layout/layout.tsx`)
   - Header with app title and mode toggle
   - Main content area (split view or tab)
   - Responsive breakpoints

3. **Style Layout** (`src/components/layout/layout.module.css`)
   - Desktop: side-by-side (input | viewer)
   - Mobile: stacked (input on top, viewer below)
   - Tab/button to switch modes

4. **Add keyboard shortcuts**
   - Global paste listener for clipboard import

5. **Polish UI**
   - Loading states
   - Empty states (placeholder text)
   - Error states styling
   - Transitions/animations

6. **Configure HTTPS** (optional, vite.config.ts)
   - Add HTTPS configuration for production

7. **Final testing**
   - End-to-end workflow: import → view → interact
   - Responsive on different screen sizes

---

## File Ownership (Exclusive)

| File | Phase Owner |
|------|-------------|
| `src/App.tsx` | Phase 5 |
| `src/components/layout/*` | Phase 5 |
| `vite.config.ts` | Phase 5 (update) |

---

## Integration Flow

```
┌─────────────────────────────────────────┐
│              Layout                      │
│  ┌─────────┐  ┌──────────────────────┐ │
│  │ Header  │  │  Mode Toggle         │ │
│  └─────────┘  └──────────────────────┘ │
│  ┌─────────┐  ┌──────────────────────┐ │
│  │ Input   │  │      Viewer          │ │
│  │ OR      │  │  + Toolbar          │ │
│  │ Viewer  │  │                      │ │
│  └─────────┘  └──────────────────────┘ │
│  ┌─────────────────────────────────────┐│
│  │ FileDropZone (drag/paste area)     ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Todo List

- [x] Update App.tsx with all components
- [x] Create layout.tsx component
- [x] Create layout.module.css
- [x] Implement mode toggle (input/view)
- [x] Add responsive breakpoints
- [x] Add keyboard shortcuts
- [x] Polish error/empty states
- [x] Configure HTTPS (optional)
- [x] Run final E2E tests
- [x] Verify no console errors

---

## Success Criteria

- Full workflow works: paste/drop/select file → view JSON → interact
- Responsive on desktop and mobile
- No console errors
- Production build succeeds

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| State conflicts between components | Low | Centralized state in App.tsx |
| Responsive issues | Medium | Test on multiple screen sizes |

---

## Security Considerations

- All client-side (no data sent to server)
- HTTPS ready via Vite configuration
- Standard browser APIs only

---

## Final Checklist

- [x] JSON input works (paste/type)
- [x] File import works (picker, drag, paste)
- [x] JSON viewer displays with syntax highlighting
- [x] Expand/collapse works
- [x] Copy to clipboard works
- [x] Theme toggle works
- [x] Responsive design works
- [x] No console errors
- [x] Production build succeeds
