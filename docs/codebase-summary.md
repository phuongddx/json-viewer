# Codebase Summary

**Version:** 0.1.0
**Last Updated:** 2026-03-14
**Type:** React 18 + TypeScript + Vite 5

## File Tree

```
src/
├── App.tsx (135 LOC)                          # Root component, theme + layout
├── main.tsx (11 LOC)                          # ReactDOM entry
├── components/
│   ├── layout/
│   │   ├── layout.tsx (33 LOC)                # Generic flex layout wrapper
│   │   └── index.ts
│   ├── json-input/
│   │   ├── json-input.tsx (84 LOC)            # Textarea + format/clear UI
│   │   ├── json-input.module.css
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
│   ├── use-json-state.ts (59 LOC)             # Parse, validate, format JSON
│   ├── use-file-import.ts (172 LOC)           # File read, drag-drop, paste
│   └── index.ts
├── styles/
│   └── globals.css (86 LOC)                   # Theme vars, resets, fonts
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
├── Layout (header, sidebar, main slots)
│   ├── header
│   │   └── Header (title + theme toggle button)
│   ├── sidebar
│   │   ├── JsonInput
│   │   └── FileDropZone
│   └── main
│       └── JsonViewerComponent (conditional: when parsedJson)
│           ├── Toolbar (copy, expand, collapse)
│           └── @textea/json-viewer (tree)
└── Placeholder (when no parsedJson)
    └── Empty state icon + text
```

### Component Props

| Component | Key Props | State |
|-----------|-----------|-------|
| `App` | none | `theme`, `rawText`, `parsedJson`, `error`, `isValid` |
| `Layout` | `header`, `sidebar`, `main` | none (composition only) |
| `JsonInput` | `value`, `error`, `isValid`, `onChange`, `onFormat`, `onClear` | none (controlled) |
| `FileDropZone` | `onDataLoaded` | `isDragOver`, `fileInputRef` |
| `JsonViewerComponent` | `data`, `theme`, `onThemeChange` | `expandLevel`, `copyStatus` |
| `Toolbar` | `onCopy`, `onExpandAll`, `onCollapseAll` | none (stateless) |

## Hook APIs

### useJsonState(initialValue = '')

**Returns:**
```typescript
{
  rawText: string;                    // Raw JSON text
  parsedJson: unknown | null;         // Parsed object or null
  error: string | null;               // JSON.parse error message
  isValid: boolean;                   // rawText.trim() !== '' && !error
  updateText(text: string): void;     // Set rawText
  formatJson(): void;                 // JSON.stringify(parsed, null, 2)
  clearAll(): void;                   // Reset rawText to ''
}
```

**Memoization:** `parsedJson` and `error` recalculated via `useMemo` on `rawText` change.

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

| File | LOC | Type |
|------|-----|------|
| App.tsx | 135 | Component |
| file-drop-zone.tsx | 187 | Component |
| use-file-import.ts | 172 | Hook |
| toolbar.tsx | 81 | Component |
| json-input.tsx | 84 | Component |
| use-json-state.ts | 59 | Hook |
| json-viewer-component.tsx | 62 | Component |
| layout.tsx | 33 | Component |
| globals.css | 86 | Style |
| **Total** | **899** | |

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
  "@mui/material": "^7.3.9",         // Installed, unused in v0.1.0
  "@textea/json-viewer": "^3.0.0",    // Main tree viewer
  "react": "^18.2.0",
  "react-dom": "^18.2.0"
}
```

**Dev Dependencies:**
- TypeScript 5.3
- Vite 5.0
- ESLint (strict config)
