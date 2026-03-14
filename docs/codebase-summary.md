# Codebase Summary

**Version:** 0.2.0-dev
**Last Updated:** 2026-03-14
**Type:** React 18 + TypeScript + Vite 5

## File Tree

```
src/
├── App.tsx (180 LOC)                          # Root component, theme + layout + mode toggle
├── main.tsx (15 LOC)                          # ReactDOM entry + Vercel analytics
├── components/
│   ├── layout/
│   │   ├── layout.tsx (38 LOC)                # Generic flex layout wrapper (optional sidebar)
│   │   └── index.ts
│   ├── json-input/
│   │   ├── json-input.tsx (105 LOC)           # Textarea + beautify/minify/clear UI
│   │   ├── fix-suggestion-banner.tsx (30 LOC) # Fix available banner (NEW)
│   │   ├── json-input.module.css
│   │   └── index.ts
│   ├── json-compare/
│   │   ├── json-compare.tsx (70 LOC)          # Compare mode container (NEW)
│   │   ├── diff-output.tsx (45 LOC)           # Semantic diff renderer (NEW)
│   │   ├── json-compare.module.css            # Compare mode styles (NEW)
│   │   └── index.ts
│   ├── file-drop-zone/
│   │   ├── file-drop-zone.tsx (187 LOC)       # Drag-drop + browse + paste
│   │   ├── file-drop-zone.module.css
│   │   └── index.ts
│   ├── json-viewer/
│   │   ├── json-viewer-component.tsx (62 LOC) # Tree viewer wrapper
│   │   ├── json-viewer-component.module.css
│   │   └── index.ts
│   └── toolbar/
│       ├── toolbar.tsx (81 LOC)               # Copy/expand/collapse controls
│       ├── toolbar.module.css
│       └── index.ts
├── hooks/
│   ├── use-json-state.ts (85 LOC)             # Parse, beautify, minify, fix JSON (UPDATED)
│   ├── use-json-repair.ts (25 LOC)            # Smart fix suggestions via jsonrepair (NEW)
│   ├── use-json-compare.ts (60 LOC)           # Dual JSON compare + diff (NEW)
│   ├── use-file-import.ts (172 LOC)           # File read, drag-drop, paste
│   └── index.ts
├── styles/
│   └── globals.css (100 LOC)                  # Theme vars, resets, fonts, warning vars (UPDATED)
├── types/
│   └── css-modules.d.ts (5 LOC)               # CSS Module typing
└── vite-env.d.ts

Config:
├── vite.config.ts                              # Vite + React plugin
├── tsconfig.json                               # TypeScript strict mode
├── package.json (v0.1.0)
├── .eslintrc.cjs
└── index.html
```

## Component Map

### Layout Hierarchy

```
App
├── Layout (header, sidebar, main slots; sidebar now optional)
│   ├── header
│   │   ├── Header (title + View|Compare mode toggle)
│   │   └── Theme toggle button
│   ├── sidebar (hidden in Compare mode)
│   │   ├── JsonInput (view mode only)
│   │   │   ├── Textarea + Beautify/Minify buttons
│   │   │   ├── FixSuggestionBanner (when invalid JSON + fix available)
│   │   │   │   └── Apply Fix / Undo buttons
│   │   │   └── Clear button
│   │   └── FileDropZone
│   └── main
│       ├── View mode: JsonViewerComponent (when parsedJson)
│       │   ├── Toolbar (copy, expand, collapse)
│       │   └── @textea/json-viewer (tree)
│       └── Compare mode: JsonCompare (NEW)
│           ├── Two JsonInput panels (side-by-side)
│           └── DiffOutput (semantic diff results)
└── Placeholder (when no parsedJson, view mode only)
    └── Empty state icon + text
```

### Component Props

| Component | Key Props | State |
|-----------|-----------|-------|
| `App` | none | `theme`, `mode`, `rawText`, `parsedJson`, `error`, `isValid` |
| `Layout` | `header`, `sidebar?`, `main` | none (composition only) |
| `JsonInput` | `value`, `error`, `isValid`, `onChange`, `onBeautify`, `onMinify`, `onClear`, `hasFixAvailable`, `onApplyFix`, `onUndo`, `canUndo` | none (controlled) |
| `FixSuggestionBanner` | `onApplyFix`, `onUndo`, `canUndo` | none (stateless) |
| `FileDropZone` | `onDataLoaded` | `isDragOver`, `fileInputRef` |
| `JsonViewerComponent` | `data`, `theme`, `onThemeChange` | `expandLevel`, `copyStatus` |
| `Toolbar` | `onCopy`, `onExpandAll`, `onCollapseAll` | none (stateless) |
| `JsonCompare` | none | uses `useJsonCompare()` internally |
| `DiffOutput` | `diffHtml`, `isIdentical`, `hasBothValid` | none (stateless) |

## Hook APIs

### useJsonState(initialValue = '')

**Returns:**
```typescript
{
  rawText: string;                    // Raw JSON text
  parsedJson: unknown | null;         // Parsed object or null
  error: string | null;               // JSON.parse error message
  isValid: boolean;                   // rawText.trim() !== '' && !error
  previousText: string | null;        // For undo support
  updateText(text: string): void;     // Set rawText
  beautifyJson(): void;               // JSON.stringify(parsed, null, 2) (renamed from formatJson)
  minifyJson(): void;                 // JSON.stringify(parsed) (NEW)
  applyFix(repairedText: string): void; // Apply fix suggestion (NEW)
  undoText(): void;                   // Restore previousText (NEW)
  clearAll(): void;                   // Reset rawText to ''
}
```

**Memoization:** `parsedJson` and `error` recalculated via `useMemo` on `rawText` change.

### useJsonRepair(rawText: string, hasError: boolean)

**Returns:**
```typescript
{
  repairedText: string;  // If available, null otherwise
} | null                 // Null if no fix possible
```

**Logic:** Wraps `jsonrepair` library; only suggests if repair differs from original and produces valid JSON.

### useJsonCompare()

**Returns:**
```typescript
{
  leftText: string;
  setLeftText(text: string): void;
  rightText: string;
  setRightText(text: string): void;
  leftError: string | null;
  rightError: string | null;
  diffHtml: string | null;             // HTML output from jsondiffpatch
  isIdentical: boolean;                // Both valid + no differences
  hasBothValid: boolean;               // Both inputs parse successfully
}
```

**Logic:** Maintains separate JSON states; computes semantic diff only when both are valid.

### useFileImport()

**Returns:**
```typescript
{
  data: unknown | null;               // Parsed file data
  error: string | null;               // Load/parse error
  isLoading: boolean;                 // Reading file
  loadFromFile(file: File): void;     // Read single file
  loadFromDrop(e: DragEvent): void;   // Extract files from drop event
  clear(): void;                      // Reset state
}
```

**Features:**
- Max 10MB file size check
- Accepts `.json` and `application/json` MIME types
- JSON.parse validation
- Async file reading with loading state

### usePasteHandler(callback)

**Internal helper in use-file-import.ts**

Listens to `paste` events globally. Callback receives `ClipboardEvent`.

**State Flow:**
```
File read (async) → setData → parent updates
                 → setError (if invalid)
                 → setIsLoading (false when done)
```

## State Flow Diagram

```
User Input
    ↓
[JsonInput textarea] → updateText() → rawText state update
    ↓
useJsonState useMemo
    ├→ JSON.parse(rawText)
    └→ Set parsedJson + error
    ↓
App renders JsonViewerComponent (if parsedJson)
    ↓
[FileDropZone] ←→ useFileImport() → loadFromFile/Drop/Paste
    ↓
onDataLoaded callback → handleDataLoaded() → formatJson() → updateText()
    ↓
Cycle repeats (rawText updated)
    ↓
[JsonViewerComponent renders tree]
    ↓
[Toolbar copy/expand/collapse]
```

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| **React Hooks only** | Sufficient for current scope; no Redux/Zustand overhead |
| **CSS Modules** | Scoped styles, no naming conflicts, tree-shakeable |
| **SVG icons inline** | No icon lib dependency, full control, accessibility (aria-hidden) |
| **@textea/json-viewer** | Lightweight, interactive, well-maintained |
| **No Tailwind** | CSS Modules more portable, smaller bundle, semantic naming |
| **TypeScript strict** | All code type-safe from day 1 |
| **useMemo for parse** | Avoid re-parsing on every render; only when rawText changes |
| **useCallback handlers** | Prevent child re-renders unnecessarily |

## File Size Summary

| File | LOC | Type | Notes |
|------|-----|------|-------|
| App.tsx | 180 | Component | +45 for mode toggle |
| file-drop-zone.tsx | 187 | Component | |
| use-file-import.ts | 172 | Hook | |
| json-compare.tsx | 70 | Component | NEW |
| json-input.tsx | 105 | Component | +21 for beautify/minify/fix |
| toolbar.tsx | 81 | Component | |
| use-json-state.ts | 85 | Hook | +26 for minify/fix/undo |
| use-json-repair.ts | 25 | Hook | NEW |
| diff-output.tsx | 45 | Component | NEW |
| use-json-compare.ts | 60 | Hook | NEW |
| json-viewer-component.tsx | 62 | Component | |
| fix-suggestion-banner.tsx | 30 | Component | NEW |
| layout.tsx | 38 | Component | +5 for optional sidebar |
| globals.css | 100 | Style | +14 for warning vars |
| **Total** | **1240** | | +341 net new |

## Performance Notes

- **JSON parse** — useMemo caches result until `rawText` changes
- **File read** — Async (non-blocking), loading state shows spinner
- **Paste handler** — Event-based, minimal overhead
- **Theme toggle** — document.documentElement.setAttribute (instant, no CSS recalc needed)
- **Expand/collapse** — @textea/json-viewer handles internally

## Testing Status

- **Framework** — Not configured (Vitest planned for v0.2.0)
- **Coverage** — 0% (target: > 80% for v0.2.0)
- **E2E** — Manual testing only

## Dependencies

```json
{
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@mui/material": "^7.3.9",           // Installed, unused
  "@textea/json-viewer": "^3.0.0",     // Main tree viewer
  "@vercel/analytics": "^2.0.1",       // User analytics & Web Vitals
  "@vercel/speed-insights": "^2.0.0",  // Core Web Vitals monitoring
  "jsonrepair": "^3.4.2",              // Smart JSON repair (NEW)
  "jsondiffpatch": "^0.6.0",           // Semantic JSON diff (NEW)
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

**Dev Dependencies:**
- TypeScript 5.3
- Vite 5.0
- ESLint (strict config)

**New in v0.2.0-dev:**
- `jsonrepair` (~12KB gz) — Fixes common JSON errors
- `jsondiffpatch` (~15KB gz) — Semantic JSON comparison
