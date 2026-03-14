# System Architecture

**Version:** 0.1.0
**Last Updated:** 2026-03-14
**Architecture Type:** Client-side React application (no backend)

## Architecture Overview

JSON Viewer is a stateless, client-side React application. All JSON parsing, validation, and rendering happens in the browser. No backend API or server required.

```
┌─────────────────────────────────────────────────────┐
│                  Browser (Client)                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              React Application                │  │
│  │  (App.tsx + Components + Hooks + State)       │  │
│  │  + Analytics + SpeedInsights (root level)     │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                            │
│  ┌──────────────┐  ┌──────────────┐               │
│  │  @textea/   │  │  @emotion/   │               │
│  │json-viewer  │  │   react      │               │
│  └──────────────┘  └──────────────┘               │
│                        ↓                            │
│  ┌───────────────────────────────────────────────┐  │
│  │         DOM Rendering + Event Handlers        │  │
│  │   (CSS Modules, Theme Variables, Styling)     │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │          Browser File API (FileReader)        │  │
│  │          Clipboard API (Paste Events)         │  │
│  └───────────────────────────────────────────────┘  │
│                        ↓                            │
│  ┌───────────────────────────────────────────────┐  │
│  │    Vercel Analytics Edge Functions            │  │
│  │  (page views, Web Vitals → Vercel dashboard)  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘

No server, API, database, or backend services.
Vercel Analytics: Client-side only (no PII collected).
```

## Component Tree & Data Flow

```
App (root)
├─ theme state
├─ useJsonState() → { rawText, parsedJson, error, isValid }
├─ useEffect() → applies theme to <html data-theme>
│
├─ Layout (composition wrapper)
│  │
│  ├─ header slot
│  │  └─ Header (title, theme toggle)
│  │     └─ button onClick={toggleTheme}
│  │        └─ updates App state → useEffect reapplies theme
│  │
│  ├─ sidebar slot
│  │  │
│  │  ├─ JsonInput
│  │  │  ├─ textarea value={rawText} onChange={updateText}
│  │  │  ├─ button "Format" onClick={formatJson}
│  │  │  ├─ button "Clear" onClick={clearAll}
│  │  │  └─ Displays error message (if isValid = false)
│  │  │
│  │  └─ FileDropZone
│  │     ├─ useFileImport() → { data, error, isLoading, load*, clear }
│  │     ├─ onDrop → loadFromDrop() → parseJson → data state
│  │     ├─ onClick → file input → loadFromFile()
│  │     ├─ onPaste (global) → load JSON from clipboard
│  │     ├─ displays loading spinner (isLoading)
│  │     ├─ displays error (if error)
│  │     ├─ displays success (if data loaded)
│  │     └─ onDataLoaded callback → parent App
│  │        └─ App.handleDataLoaded(data)
│  │           └─ formatJson() → updateText() → rawText changes
│  │
│  └─ main slot
│     ├─ Placeholder (if !parsedJson)
│     │  └─ Icon + "No JSON to display"
│     │
│     └─ JsonViewerComponent (if parsedJson)
│        ├─ Toolbar
│        │  ├─ button "Copy JSON" onClick={copy}
│        │  ├─ button "Expand All" onClick={expand}
│        │  └─ button "Collapse All" onClick={collapse}
│        │
│        └─ @textea/json-viewer
│           └─ Interactive tree rendering of parsedJson
│              ├─ Expandable nodes
│              ├─ Syntax highlighting (via component)
│              └─ Click handlers for node selection
```

## State Management Architecture

### App Component (Root)

```typescript
// Theme state — global, persists in document attribute
const [theme, setTheme] = useState<Theme>('dark')

// JSON state — managed via custom hook
const {
  rawText,              // Raw JSON text from textarea
  parsedJson,           // Parsed object (null if invalid)
  error,                // JSON.parse error message
  isValid,              // Derived: rawText.trim() !== '' && !error
  updateText,           // Setter for rawText
  formatJson,           // Format and re-stringify JSON
  clearAll,             // Reset to empty
} = useJsonState()
```

### useJsonState Hook

```typescript
const [rawText, setRawText] = useState(initialValue)

const { parsedJson, error } = useMemo(() => {
  // Expensive computation: only recalc when rawText changes
  if (!rawText.trim()) return { parsedJson: null, error: null }
  try {
    const parsed = JSON.parse(rawText)
    return { parsedJson: parsed, error: null }
  } catch (e) {
    return { parsedJson: null, error: e.message }
  }
}, [rawText])

const isValid = useMemo(() => {
  return rawText.trim() !== '' && !error && parsedJson !== null
}, [rawText, error, parsedJson])

return { rawText, parsedJson, error, isValid, updateText, formatJson, clearAll }
```

### useFileImport Hook

```typescript
const [data, setData] = useState<unknown | null>(null)
const [error, setError] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)

const loadFromFile = useCallback((file: File) => {
  if (file.size > 10 * 1024 * 1024) {
    setError('File too large')
    return
  }

  setIsLoading(true)
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      const parsed = JSON.parse(content)
      setData(parsed)
      setError(null)
    } catch (err) {
      setError('Invalid JSON')
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }
  reader.readAsText(file)
}, [])
```

## Data Flow Diagram (ASCII)

```
┌──────────────────────────────────────────────────────────────┐
│  INPUT SOURCES                                               │
└──────────────────────────────────────────────────────────────┘

    User Types JSON          User Drops File      User Pastes JSON
           ↓                        ↓                    ↓
    JsonInput              FileDropZone         FileDropZone
     textarea                drag-drop           paste handler
           ↓                        ↓                    ↓
           └────────────────────────┴────────────────────┘
                           ↓
                    [Data Converges]
                           ↓
                  App.handleDataLoaded()
                           ↓
                   formatJson() + updateText()
                           ↓
    ┌──────────────────────────────────────────────────────────┐
    │  JSON STATE (useJsonState)                               │
    ├──────────────────────────────────────────────────────────┤
    │  rawText ────────→ [useMemo: JSON.parse()]              │
    │                              ↓                           │
    │                   ┌──────────────────────┐               │
    │                   │  parsedJson (or null)│               │
    │                   │  error (or null)     │               │
    │                   └──────────────────────┘               │
    │                              ↓                           │
    │                   isValid = !error && rawText.trim()    │
    └──────────────────────────────────────────────────────────┘
                           ↓
                    [Render Decision]
                           ↓
        ┌───────────────────────────────────────┐
        │  if (parsedJson)                      │
        │    → JsonViewerComponent renders tree │
        │  else                                 │
        │    → Placeholder message              │
        └───────────────────────────────────────┘
                           ↓
                   @textea/json-viewer
                           ↓
              User clicks Expand/Collapse Nodes
                     ← Internal Component State
```

## Styling System

### Theme Architecture

**Mechanism:** CSS Custom Properties (CSS Variables) on `<html>` element.

```html
<!-- In App.tsx -->
<html data-theme="dark">  ← Set via useEffect
```

```css
/* globals.css */

:root {
  /* Default = light theme (fallback) */
  --color-bg: #ffffff;
  --color-text: #0f172a;
  --color-border: #e2e8f0;
  --color-accent: #2563eb;
  --color-success: #10b981;
  --color-error: #ef4444;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-border: #1e293b;
  --color-accent: #3b82f6;
  --color-success: #34d399;
  --color-error: #f87171;
}

[data-theme="light"] {
  /* Explicitly set light (overrides :root) */
  --color-bg: #ffffff;
  --color-text: #0f172a;
  /* ... */
}
```

### Component Styling (CSS Modules)

Each component has a `.module.css` file with scoped classes.

```typescript
// Component
import styles from './json-input.module.css'

export function JsonInput({ value, onChange }: ...) {
  return (
    <div className={styles.container}>
      <textarea className={styles.input} value={value} />
    </div>
  )
}

// CSS Module file (json-input.module.css)
.container {
  display: flex;
  flex-direction: column;
}

.input {
  background: var(--color-bg);    ← Uses custom property
  color: var(--color-text);       ← Switches with theme
  border: 1px solid var(--color-border);
}
```

### Theme Toggle Implementation

```typescript
// App.tsx
const toggleTheme = useCallback(() => {
  setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
}, [])

useEffect(() => {
  // Apply theme to document root
  document.documentElement.setAttribute('data-theme', theme)
}, [theme])

// Result: All var(--color-*) values update immediately
// No page reload, no CSS recalculation penalty
```

## Third-Party Integration

### @textea/json-viewer

**Purpose:** Render interactive JSON tree (expand/collapse nodes)

**Usage:**
```typescript
import JsonViewer from '@textea/json-viewer'

export function JsonViewerComponent({ data, theme }) {
  return (
    <JsonViewer
      value={data}
      theme={theme === 'dark' ? 'dark' : 'light'}
      expandLevel={1}
      onCopy={(path) => copyToClipboard(path)}
    />
  )
}
```

### Vercel Analytics & Speed Insights

**Purpose:** Monitor application performance and user engagement.

**Components:**
- `@vercel/analytics` — Tracks page views, route changes, Web Vitals
- `@vercel/speed-insights` — Tracks Core Web Vitals (CLS, FID, LCP)

**Usage:**
```typescript
// main.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />          // Root-level, no props needed
    <SpeedInsights />      // Root-level, no props needed
  </React.StrictMode>,
)
```

**Data:** Vercel Analytics is zero-code, client-side only. Does not collect PII. Dashboard accessible via Vercel project settings.

**Note:** @mui/material is installed but not yet used in v0.1.0 (planned for v0.2.0).

## Browser APIs Used

### FileReader API

Reading local files selected via drag-drop or file input.

```typescript
const reader = new FileReader()
reader.onload = (e) => {
  const content = e.target?.result as string
  // Parse content
}
reader.readAsText(file)
```

### Clipboard API

Detect paste events and read clipboard data.

```typescript
document.addEventListener('paste', (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text')
  // Parse text
})
```

### Drag and Drop API

Handle drag-over, drag-leave, drop events.

```typescript
element.addEventListener('dragover', (e) => {
  e.preventDefault()  // Allow drop
  e.dataTransfer.dropEffect = 'copy'
})

element.addEventListener('drop', (e) => {
  const files = e.dataTransfer?.files
  // Process files
})
```

## Performance Characteristics

### Parse Performance

| JSON Size | Parse Time | Status |
|-----------|-----------|--------|
| < 1 MB    | < 100ms   | ✓ Acceptable |
| 1-10 MB   | 100-500ms | ⚠ Noticeable delay |
| > 10 MB   | Rejected  | Blocked by file size limit |

### Memory Usage

- **JSON object in memory** — Native JavaScript object (no extra copies)
- **FileReader** — Reads entire file at once (streaming not implemented)
- **DOM nodes** — @textea/json-viewer virtualizes if data is large

### Rendering Performance

- **useCallback** — Handlers memoized to prevent child re-renders
- **useMemo** — JSON parsing cached (only recalc on rawText change)
- **CSS** — No animations on theme change; instant switch via variables

## Security Considerations

### No Sensitive Data on Network

All processing client-side. No JSON data sent to any server.

### XSS Prevention

- React automatically escapes text content
- No `dangerouslySetInnerHTML` used
- All user input passed through JSON.parse (implicit validation)

### File Size Limit

Max 10 MB to prevent browser memory exhaustion.

## Constraints & Limitations

1. **No offline support** — Requires browser; no Service Worker
2. **No search/filter** — Planned for v0.2.0
3. **No JSON Schema validation** — Planned for v0.3.0
4. **Clipboard paste** — Only works when no input focused
5. **Mobile breakpoints** — Partial; polish in v0.2.0
6. **No syntax coloring in textarea** — Considered for v0.2.0

## Future Architecture Considerations

### v0.2.0

- Add Vitest for unit testing
- Extract theme logic into Context API (if more components added)
- Consider MUI integration for consistent UI

### v0.3.0

- Add search/filter across JSON tree
- JSON Schema validation
- Copy path (JSON Pointer format)
- Local storage persistence (recent files)
