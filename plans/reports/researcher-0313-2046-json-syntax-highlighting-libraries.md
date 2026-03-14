# JSON Syntax Highlighting Libraries Research

**Date:** 2026-03-13
**Context:** Lightweight JSON viewer for web application

---

## Summary

For a lightweight JSON viewer in a React web app, recommended options are:
- **Best overall:** `@textea/json-viewer` or `react-json-view-lite` for interactive tree view
- **Best for syntax highlighting only:** CodeMirror 6 with JSON language support
- **Avoid:** Monaco Editor (too heavy for simple JSON viewing)

---

## Library Comparison

### 1. react-json-view (v1.21.3)

| Metric | Value |
|--------|-------|
| Bundle Size | 116KB (32KB gzipped) |
| Dependencies | flux, react-base16-styling, react-textarea-autosize |
| React Support | v15.5+, v16, v17 |
| Status | Mature, last update 2021 |

**Pros:**
- Full interactive tree view with expand/collapse
- Editable JSON
- Theming support (base-16 themes)
- Copy to clipboard, search functionality

**Cons:**
- Not actively maintained (last update 2021)
- Relatively large bundle
- Peer dependencies on flux (unnecessary for viewing)

---

### 2. @textea/json-viewer (v4.0.1)

| Metric | Value |
|--------|-------|
| Bundle Size | ~80KB (estimated) |
| Dependencies | Minimal |
| React Support | React 18+ |
| Status | Actively maintained (Dec 2024) |

**Pros:**
- Modern React 18 support
- Tree view with virtualization for large JSON
- Customizable styling
- Actively maintained
- TypeScript support

**Cons:**
- Newer, less community adoption

---

### 3. react-json-view-lite (v2.5.0)

| Metric | Value |
|--------|-------|
| Bundle Size | ~25KB (estimated) |
| Dependencies | None |
| React Support | React 16.8+ |
| Status | Actively maintained |

**Pros:**
- Focus on performance for large JSON
- Lightweight
- Customizable
- Tree view with expand/collapse

**Cons:**
- Less features than react-json-view
- Newer package

---

### 4. CodeMirror 6 (JSON Language Support)

| Metric | Value |
|--------|-------|
| JSON Support | ~10-15KB |
| Full Editor | ~200KB+ |
| Dependencies | @codemirror/language, @lezer/json |
| Framework | Framework-agnostic |

**Pros:**
- Excellent syntax highlighting
- Modular (pay for what you use)
- Accessible, mobile-friendly
- Can be used as read-only viewer

**Cons:**
- Full editor is heavy
- Requires setup for read-only JSON display
- Not a tree view by default

---

### 5. Prism.js (v1.29.0)

| Metric | Value |
|--------|-------|
| Bundle Size | 19KB (7KB gzipped) |
| Dependencies | None |
| Framework | Framework-agnostic |

**Pros:**
- Lightest option for highlighting only
- No dependencies
- Easy to integrate
- Works with any framework

**Cons:**
- Only syntax highlighting, no tree view
- Static display only
- Must handle JSON parsing yourself

---

### 6. highlight.js

| Metric | Value |
|--------|-------|
| Bundle Size | 30-50KB (full) / 10KB (json only) |
| Dependencies | None |
| Framework | Framework-agnostic |

**Pros:**
- Similar to Prism.js
- Many themes available
- Auto-detection of language

**Cons:**
- Similar limitations as Prism.js
- Larger than Prism.js for same use case

---

### 7. Monaco Editor

| Metric | Value |
|--------|-------|
| Bundle Size | 2MB+ (full) |
| Dependencies | None (self-contained) |
| Framework | Framework-agnostic |

**Pros:**
- Full code editor (VS Code's editor)
- Excellent JSON support, validation, formatting
- Professional features

**Cons:**
- Extremely large bundle
- Overkill for simple JSON viewing
- Not suitable for lightweight needs

---

## Recommendations

### For Interactive Tree View (Recommended)
| Priority | Library | Why |
|----------|---------|-----|
| 1 | `@textea/json-viewer` | Modern, actively maintained, React 18, good performance |
| 2 | `react-json-view-lite` | Lightest, focused on performance |
| 3 | `react-json-view` | Mature, feature-rich, but older |

### For Syntax Highlighting Only
| Priority | Library | Why |
|----------|---------|-----|
| 1 | Prism.js | Lightest (7KB gzipped), no deps |
| 2 | CodeMirror 6 | Better highlighting, modular |

---

## Conclusion

For a **lightweight JSON viewer** in a React web app:

- **Use `@textea/json-viewer`** if you need interactive tree view with modern React
- **Use `react-json-view-lite`** if bundle size is critical
- **Use Prism.js** if you only need syntax highlighting (no tree view)

Avoid Monaco Editor for simple JSON viewing use cases.

---

## Unresolved Questions

1. What specific features does the project need? (tree view vs highlighting only)
2. Is the JSON typically large (requiring virtualization)?
3. Does the project need editable JSON or read-only display?
