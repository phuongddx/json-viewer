# Code Standards

**Version:** 0.1.0
**Last Updated:** 2026-03-14
**Framework:** React 18 + TypeScript 5.3

## File Naming

### General Rules

- **Format:** kebab-case for all file names
- **Purpose:** File name must clearly describe purpose (self-documenting)
- **Length:** OK to be long if it improves clarity
- **Example:** `use-json-state.ts`, `file-drop-zone.tsx`, `json-viewer-component.tsx`

### Directory Structure

```
src/
├── components/
│   ├── {ComponentName}/
│   │   ├── {component-name}.tsx              # Main component
│   │   ├── {component-name}.module.css       # Scoped styles
│   │   └── index.ts                          # Export barrel
├── hooks/
│   ├── use-{hook-name}.ts                    # Custom hook
│   └── index.ts
├── styles/
│   └── globals.css                           # Global theme, resets
└── types/
    └── {type-name}.d.ts                      # Type definitions
```

## Component Conventions

### Functional Components

All components are functional (React.FC or explicit return).

```typescript
// ✓ Good
export function JsonInput({ value, onChange }: JsonInputProps) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} />
}

// ✗ Avoid
const JsonInput: React.FC<JsonInputProps> = ({ value }) => { ... }
```

**Why:** Explicit return type inference is clearer; FC type doesn't add value.

### Props Interface

Each component exports a `Props` interface.

```typescript
export interface JsonInputProps {
  value: string;
  onChange: (text: string) => void;
  onFormat: () => void;
  error?: string | null;
  isValid: boolean;
}

export function JsonInput(props: JsonInputProps) { ... }
```

### Default Props

Use ES6 defaults in function signature.

```typescript
export function JsonInput({
  value,
  onChange,
  error = null,  // Default
  isValid = false
}: JsonInputProps) { ... }
```

### Children Prop

Explicit, not implicit.

```typescript
interface LayoutProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

export function Layout({ header, sidebar, main }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{main}</main>
    </div>
  )
}
```

### Conditional Rendering

Use **early returns** for cleaner code.

```typescript
// ✓ Good
if (!data) {
  return <Placeholder />
}

return <TreeViewer data={data} />

// ✗ Avoid
return data ? <TreeViewer data={data} /> : <Placeholder />
```

## CSS Module Patterns

### File Structure

```typescript
// json-input.tsx
import styles from './json-input.module.css'

export function JsonInput(...) {
  return (
    <div className={styles.container}>
      <textarea className={styles.input} />
      <button className={styles.formatBtn}>Format</button>
    </div>
  )
}
```

### Naming Convention

- **Container/wrapper:** `container`, `wrapper`, `root`
- **Components within:** semantic names (e.g., `input`, `button`, `icon`)
- **States:** `active`, `disabled`, `error`, `dragOver`
- **Modifiers:** combine with space: `${styles.button} ${isActive ? styles.active : ''}`

```css
/* json-input.module.css */
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input {
  padding: 8px;
  border: 1px solid var(--color-border);
  font-family: 'Fira Code', monospace;
}

.input:focus {
  border-color: var(--color-accent);
  outline: none;
}

.formatBtn {
  background: var(--color-accent);
  color: var(--color-bg);
  cursor: pointer;
}

.formatBtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Conditional Classes

```typescript
const className = `${styles.button} ${isDisabled ? styles.disabled : ''}`
// or
const className = [styles.button, isDisabled && styles.disabled]
  .filter(Boolean)
  .join(' ')
```

### Theme Variables

All colors use CSS Custom Properties.

```css
:root {
  /* Light theme (default via <html data-theme="light">) */
  --color-bg: #ffffff;
  --color-text: #0f172a;
  --color-border: #e2e8f0;
  --color-accent: #2563eb;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-text: #f1f5f9;
  --color-border: #1e293b;
  --color-accent: #3b82f6;
}
```

## TypeScript Practices

### Strict Mode

All files compile under `tsconfig.json` strict mode:
- `noImplicitAny: true`
- `noImplicitThis: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`

**No `any` type.** Use `unknown` and type guard if needed.

```typescript
// ✓ Good
function parseJson(input: unknown): unknown | null {
  if (typeof input === 'string') {
    try {
      return JSON.parse(input)
    } catch {
      return null
    }
  }
  return null
}

// ✗ Avoid
function parseJson(input: any): any { ... }
```

### Type Exports

Export types used by consumers.

```typescript
// use-json-state.ts
export type UseJsonStateReturn = ReturnType<typeof useJsonState>

// Consumer can import
import type { UseJsonStateReturn } from './hooks/use-json-state'
```

### Enum vs Union Types

Prefer union types for simple string/number enums.

```typescript
// ✓ Good
type Theme = 'light' | 'dark'

// Avoid unions that will grow: use enum
enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Error = 'error',
}
```

## Hook Patterns

### Custom Hooks Naming

All custom hooks start with `use-` prefix.

```typescript
export function useJsonState(initialValue: string = '') {
  const [rawText, setRawText] = useState(initialValue)
  // ...
  return { rawText, parsedJson, error, isValid, updateText, formatJson, clearAll }
}
```

### useMemo for Expensive Computations

Only use `useMemo` when:
1. Computation is expensive (e.g., JSON.parse on large data)
2. Value is passed as dependency to child component

```typescript
// ✓ Good — JSON parse is expensive, result used by children
const { parsedJson, error } = useMemo(() => {
  if (!rawText.trim()) return { parsedJson: null, error: null }
  try {
    return { parsedJson: JSON.parse(rawText), error: null }
  } catch (e) {
    return { parsedJson: null, error: e.message }
  }
}, [rawText])

// ✗ Avoid — simple string operation
const upperText = useMemo(() => text.toUpperCase(), [text])
```

### useCallback for Event Handlers

Use `useCallback` when passing handler to memoized child or in dependency arrays.

```typescript
// ✓ Good — passed to child
const handleChange = useCallback((text: string) => {
  updateText(text)
}, [updateText])

<JsonInput onChange={handleChange} />

// ✓ Good — used in useEffect dependency
const handleFormat = useCallback(() => {
  formatJson()
}, [])

useEffect(() => {
  // subscribe to format event
}, [handleFormat])
```

### Dependency Arrays

Always include all dependencies in arrays. ESLint will catch missing ones.

```typescript
// ✓ Good
useEffect(() => {
  if (data && !error) {
    onDataLoaded(data)
  }
}, [data, error, onDataLoaded])  // All deps listed

// ✗ Avoid
useEffect(() => {
  onDataLoaded(data)
}, [data])  // Missing onDataLoaded, error
```

## Error Handling

### Try-Catch Pattern

```typescript
try {
  const parsed = JSON.parse(rawText)
  // ...
} catch (e) {
  const errorMessage = e instanceof Error ? e.message : 'Invalid JSON'
  setError(errorMessage)
}
```

### Validation Before Use

```typescript
// File size check
if (file.size > 10 * 1024 * 1024) {
  setError('File too large (max 10MB)')
  return
}

// MIME type check
if (!['application/json', 'text/plain'].includes(file.type)) {
  // Fallback check: try parse anyway
}
```

## Comment Guidelines

### Inline Comments

For complex logic, add brief explanation.

```typescript
// Avoid re-parsing on every render; only when rawText changes
const { parsedJson, error } = useMemo(() => {
  // ...
}, [rawText])
```

### JSDoc for Public APIs

Document function params and return.

```typescript
/**
 * Hook for managing JSON state with parsing and error handling
 * @param initialValue - Initial JSON string (default: empty)
 * @returns Object with rawText, parsedJson, error, isValid, and methods
 */
export function useJsonState(initialValue: string = '') {
  // ...
}
```

## Accessibility Standards

### ARIA Labels on Icon Buttons

```typescript
<button
  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
  onClick={toggleTheme}
>
  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
</button>
```

### Semantic HTML

```typescript
// ✓ Good
<button type="button" onClick={handleClick}>Copy</button>
<input type="file" accept=".json" />
<textarea defaultValue={json} />

// ✗ Avoid
<div onClick={handleClick}>Copy</div>  // Not keyboard accessible
```

### Focus Management

```typescript
// Always visible focus indicator in CSS
.button:focus {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

## Performance Optimization

### Code Splitting

Not yet implemented. Planned for future versions.

### Bundle Analysis

Check build size:
```bash
npm run build
# Check dist/ folder size
```

## ESLint Rules

All configured in `.eslintrc.cjs`:
- No unused imports
- No unused variables
- No console in production (warn in dev)
- Proper React hooks rules

Run:
```bash
npm run lint
```

## Testing Standards (Planned for v0.2.0)

- **Framework:** Vitest
- **Coverage Target:** > 80%
- **Pattern:** One test file per component/hook
- **Naming:** `{component}.test.tsx`, `{hook}.test.ts`
