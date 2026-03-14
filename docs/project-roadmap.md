# Project Roadmap

**Last Updated:** 2026-03-14
**Current Version:** v0.1.0
**Next Release:** v0.2.0 (targeted Q2 2026)

## v0.1.0 — Initial Release (Current)

**Status:** Complete ✓

### Completed Features

- [x] React 18 + TypeScript 5.3 setup
- [x] Interactive JSON tree viewer (@textea/json-viewer)
- [x] Dark/light theme toggle with CSS Custom Properties
- [x] JSON input textarea with real-time validation
- [x] File drop-zone (drag-drop, click browse, clipboard paste)
- [x] Format JSON (auto-indent 2 spaces)
- [x] Expand/collapse tree nodes
- [x] Copy JSON to clipboard
- [x] Error feedback (invalid JSON display)
- [x] ARIA labels and keyboard navigation
- [x] Respects prefers-reduced-motion
- [x] Vite dev server and production build
- [x] ESLint strict configuration
- [x] Basic documentation (README, code standards, architecture)

### Known Limitations

- No automated tests (no Vitest)
- @mui/material installed but unused
- Mobile breakpoints partially defined
- No search/filter functionality
- No JSON path copy (copy full JSON only)
- No syntax highlighting in textarea
- Max 10 MB file size (browser memory limit)

---

## v0.2.0 — Polish & Testing (Planned)

**Target Release:** Q2 2026
**Priority:** High
**Owner:** TBD

### Testing & Quality

- [ ] **Vitest Setup**
  - Configure vitest.config.ts
  - React Testing Library integration
  - 80%+ code coverage target
  - GitHub Actions CI/CD for tests

- [ ] **Component Unit Tests**
  - JsonInput validation and formatting
  - FileDropZone file handling (all 3 methods)
  - JsonViewerComponent expand/collapse
  - Toolbar copy functionality
  - useJsonState hook behavior

- [ ] **Integration Tests**
  - Drag-drop file → parse → display flow
  - Theme toggle persistence (localStorage)
  - Paste event handling
  - Error state transitions

### Mobile & Responsive Design

- [ ] **Mobile Breakpoints**
  - Stack layout vertically on < 768px
  - Textarea height responsive
  - Font size scaling
  - Touch-friendly button targets (min 44px)

- [ ] **Tablet Optimization**
  - Optimized two-column layout
  - Sidebar collapse/expand toggle
  - Reduced padding on narrower screens

### Minor Enhancements

- [ ] **Syntax Highlighting in Textarea**
  - Integrate lightweight code editor (e.g., react-simple-code-editor)
  - JSON-specific highlighting rules
  - No external editor bloat

- [ ] **Copy Path Feature**
  - Click node → copy JSON Pointer path (RFC 6901)
  - E.g., `/users/0/name`
  - Toast notification on copy

- [ ] **Theme Persistence**
  - Save theme choice to localStorage
  - Recall on next visit
  - Respect system preference as fallback

- [ ] **@mui/material Integration** (Optional)
  - Evaluate need for Material Design components
  - Replace custom buttons/inputs if justified
  - Keep bundle size in check

### Documentation Updates

- [ ] Update docs with test patterns
- [ ] Add mobile design guidelines
- [ ] Document localStorage keys
- [ ] Update roadmap with v0.3.0 scope

---

## v0.3.0 — Advanced Features (Planned)

**Target Release:** Q3 2026
**Priority:** Medium
**Owner:** TBD

### Search & Filtering

- [ ] **Search Across JSON**
  - Search by key name or value
  - Highlight matches in tree
  - Show match count
  - Case-sensitive toggle

- [ ] **Filter by Value Type**
  - Show only strings / numbers / booleans / arrays / objects
  - Quick filter buttons
  - Combine filters

### JSON Schema Validation

- [ ] **Schema Upload**
  - Load JSON Schema file or paste
  - Validate JSON against schema
  - Display schema violations with line numbers

- [ ] **Schema Suggestions**
  - Auto-detect common schema types (e.g., OpenAPI, AsyncAPI)
  - Quick-pick schema templates

### Advanced Copy

- [ ] **Copy as Different Formats**
  - JavaScript object `{ ... }`
  - Python dict `{ ... }`
  - Go struct (struct generation)
  - YAML

- [ ] **Copy Path Options**
  - JSON Pointer (RFC 6901) — `/path/to/key`
  - Dot notation — `path.to.key`
  - Bracket notation — `path['to']['key']`

### Performance & UX

- [ ] **Large JSON Optimization**
  - Virtual scrolling for huge trees (> 10k nodes)
  - Progressive rendering
  - Lazy expand (defer child parsing)

- [ ] **Keyboard Shortcuts**
  - Cmd+K / Ctrl+K — Focus search
  - Cmd+C / Ctrl+C — Copy selected node path
  - Cmd+Z / Ctrl+Z — Undo clear action (undo history)

- [ ] **Recent Files**
  - Store last 5 files in localStorage
  - Quick access button
  - Clear recent history

### Data Export

- [ ] **Export Options**
  - Download as JSON file
  - Export filtered results
  - Export as CSV (for tabular data)

---

## v0.4.0+ — Ecosystem & Tools (Future)

**Target Release:** Beyond Q3 2026

### Planned Explorations

- **Collaborative Editing** — Share JSON view link (requires backend)
- **Diff Tool** — Compare two JSON objects, highlight differences
- **Schema Generator** — Generate JSON Schema from example
- **Type Generator** — Generate TypeScript interfaces from JSON
- **Validation Rules Builder** — Visual rule creation for custom validation
- **API Integration** — Fetch JSON from URL directly
- **Browser Extension** — View JSON from any webpage

---

## Release Schedule

| Version | Target Date | Status | Owner |
|---------|------------|--------|-------|
| v0.1.0  | 2026-03-14 | ✓ Complete | - |
| v0.2.0  | Q2 2026 (May-Jun) | Planned | TBD |
| v0.3.0  | Q3 2026 (Jul-Sep) | Planned | TBD |
| v0.4.0+ | Beyond Q3 2026 | Ideas | TBD |

---

## Metrics & Success Tracking

### v0.1.0 Success

- [x] App deployable and functional
- [x] No TypeScript errors in strict mode
- [x] ESLint passes on all files
- [x] Documentation complete
- [x] Theme toggle works instantly
- [x] File import works (all 3 methods)
- [x] JSON parsing correct on all test inputs

### v0.2.0 Success Criteria

- [ ] 80%+ test coverage
- [ ] All tests pass in CI/CD
- [ ] Mobile responsive (tested on 375px - 1920px)
- [ ] Lighthouse score ≥ 90 (Performance, A11y, Best Practices)
- [ ] Bundle size < 200 KB gzipped (with deps)
- [ ] No Vitest warnings or flaky tests
- [ ] Performance: JSON parse < 100ms for 1MB

### v0.3.0 Success Criteria

- [ ] Search finds all matching keys/values
- [ ] Schema validation accurate
- [ ] Export formats tested and verified
- [ ] 85%+ test coverage
- [ ] Copy path matches RFC 6901 spec
- [ ] Performance: < 500ms for 10k node tree

---

## Dependencies & Breaking Changes

### Current Dependencies

```json
{
  "@textea/json-viewer": "^3.0.0",
  "@emotion/react": "^11.14.0",
  "@mui/material": "^7.3.9",
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

### Planned Additions (v0.2.0+)

- `vitest` — Testing framework
- `react-testing-library` — Component testing
- Possibly: `react-simple-code-editor` or `prismjs` — Syntax highlighting

### No Breaking Changes Planned

All versions maintain backward compatibility (no API change).

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| Bundle size grows (Vitest, Testing lib) | Medium | Low | Monitor with bundle analyzer |
| Mobile responsive takes longer | Medium | Medium | Ship v0.2.0 in parts if needed |
| Schema validation scope creep | Low | High | Define strict v0.3.0 scope early |
| Performance degradation on large JSON | Low | High | Profile and optimize before v0.3.0 |

---

## Notes

### Design Philosophy

- **YAGNI** — Only build what's needed for current version
- **KISS** — Keep interfaces simple; complexity can be added later
- **DRY** — Reuse code patterns across components
- **Mobile-first thinking** — Responsive from start, polish over time

### Team Handoff Readiness

- Documentation complete for v0.1.0
- Code standards established
- Testing patterns ready for v0.2.0
- No technical debt blocking future work
