# Project Overview & PDR

**Project:** JSON Viewer
**Version:** 0.1.0
**Status:** Initial Release
**Last Updated:** 2026-03-14

## Executive Summary

JSON Viewer is a lightweight, web-based tool for viewing, navigating, and inspecting JSON data. It supports multiple input methods (paste, drag-drop, browse, clipboard), real-time validation, dark/light theming, and an interactive tree display powered by `@textea/json-viewer`.

## Target Users

- **Developers** — Quick JSON inspection without external tools
- **Data Scientists** — Visualize API responses, config files
- **QA Engineers** — Inspect test payloads, API responses
- **DevOps** — View logs, config JSON quickly

## Functional Requirements

### Core Features (v0.1.0 — Complete)

#### 1. JSON Input
- **Textarea** with syntax highlighting guidance
- **Real-time validation** with error messages
- **Format** button — auto-indent 2 spaces
- **Clear** button — reset to empty

#### 2. File Import
- **Drag-drop** zone with visual feedback (isDragOver state)
- **Click to browse** file dialog (`.json` or `application/json`)
- **Paste from clipboard** globally (detects JSON text or file)
- **Max file size** 10MB, with error handling
- **Loading state** during file read

#### 3. JSON Display
- **Interactive tree** via @textea/json-viewer
- **Expand/collapse** nodes
- **Copy to clipboard** — selected path or full JSON
- **Toolbar** with copy, expand all, collapse all buttons
- **Keyboard accessible** navigation

#### 4. Theming
- **Dark theme** (default) — `#0F172A` bg, `#F1F5F9` text
- **Light theme** — `#FFFFFF` bg, `#0F172A` text
- **Persistent theme toggle** in header
- **Respects** `prefers-color-scheme` for system preference
- **CSS Custom Properties** for easy customization

#### 5. Accessibility
- **ARIA labels** on icon buttons
- **Keyboard navigation** (Tab, Enter, Space)
- **Focus management** and visible focus styles
- **Semantic HTML** (buttons, inputs, roles)
- **Respects** `prefers-reduced-motion`

### Non-Functional Requirements

| Requirement | Target | Status |
|-------------|--------|--------|
| **Performance** | < 100ms JSON parse (< 1MB) | Met |
| **Bundle Size** | < 150KB gzipped (deps included) | Met |
| **Browser Support** | Chrome, Firefox, Safari, Edge (latest 2) | Assumed |
| **Mobile** | Responsive to 375px width (polish in v0.2.0) | Partial |
| **Accessibility** | WCAG 2.1 Level A | Met |
| **Type Safety** | 100% TypeScript strict mode | Met |
| **Monitoring** | Vercel Analytics for Web Vitals tracking | Implemented |

## Success Criteria

### User Experience
- [x] User can paste JSON and see tree instantly
- [x] User can drag-drop file and see tree
- [x] User gets immediate error feedback on invalid JSON
- [x] User can toggle theme without page reload
- [x] User can copy nodes to clipboard
- [x] User can format minified JSON

### Code Quality
- [x] All TypeScript strict mode (no `any`)
- [x] No unused imports (eslint enforced)
- [x] Component files < 200 LOC
- [x] Hooks are memoized and optimized

### Product Readiness (v0.1.0)
- [x] Initial documentation complete
- [x] Vite dev and build working
- [x] No console errors in dev mode
- [x] Theme toggle functional
- [x] File import working (all 3 methods)

## Product Constraints & Decisions

### Technology Stack
- **No state management library** — React Hooks sufficient for current scope
- **No Tailwind CSS** — CSS Modules for better control and bundle size
- **@textea/json-viewer only** — No custom tree implementation
- **@mui/material installed** but deferred to v0.2.0 (avoid scope creep)

### Design Constraints
- **SVG icons inline** — No icon library, reduces dependencies
- **Fira Code font** — Monospace for code; system fonts for UI
- **CSS Custom Properties** — All colors themeable via `[data-theme]` attribute
- **Single layout** — No mobile-first breakpoints yet (v0.2.0)

## Open Questions & Decisions Log

### Deferred for v0.2.0
1. **Test Framework** — Vitest not configured in v0.1.0
2. **Mobile Polish** — Layout works but breakpoints incomplete
3. **Schema Validation** — Consider JSON Schema support in v0.3.0
4. **Copy Path** — Copy JSON Pointer path (RFC 6901) in v0.2.0
5. **MUI Integration** — Material UI components in v0.2.0+

### Known Limitations
- File size limit 10MB (browser memory constraint)
- No offline support (no Service Worker)
- No search/filter yet
- No syntax coloring in textarea (considered in v0.2.0)
- Clipboard paste only works when no input focused

## Success Metrics

- **User Time-to-Value** — < 10 seconds from paste to tree display
- **Error Clarity** — Users understand JSON parse errors
- **Theme Switch** — Instant, no reload required
- **File Support** — All common JSON file sizes (< 10MB)

## Acceptance Criteria Checklist

- [x] Dev server runs on port 3000
- [x] TypeScript builds without errors
- [x] All components render without console errors
- [x] Theme toggle switches dark ↔ light
- [x] JSON input triggers validation
- [x] File drop loads and parses JSON
- [x] Copy button works
- [x] Expand/collapse nodes work
- [x] Documentation covers all features
