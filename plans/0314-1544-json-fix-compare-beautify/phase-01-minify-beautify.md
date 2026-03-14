# Phase 1: Install Dependencies + Minify/Beautify

**Priority:** High | **Status:** pending | **Effort:** Small

## Overview
Install new deps (`jsonrepair`, `jsondiffpatch`) and replace the single "Format" button with "Beautify" + "Minify" buttons.

## Implementation Steps

### 1. Install dependencies
```bash
npm install jsonrepair jsondiffpatch --legacy-peer-deps
```

### 2. Update `src/hooks/use-json-state.ts`
- Add `minifyJson` function: `JSON.stringify(parsed)` → `setRawText(minified)`
- Add `previousText` state for undo support (used in Phase 2)
- Add `undoText` function to restore `previousText`
- Rename `formatJson` → `beautifyJson` for clarity
- Export new functions

```typescript
// New state
const [previousText, setPreviousText] = useState<string | null>(null)

// Renamed + enhanced
const beautifyJson = useCallback(() => {
  if (!rawText.trim() || error) return
  try {
    const parsed = JSON.parse(rawText)
    setPreviousText(rawText)
    setRawText(JSON.stringify(parsed, null, 2))
  } catch {}
}, [rawText, error])

// New
const minifyJson = useCallback(() => {
  if (!rawText.trim() || error) return
  try {
    const parsed = JSON.parse(rawText)
    setPreviousText(rawText)
    setRawText(JSON.stringify(parsed))
  } catch {}
}, [rawText, error])

const undoText = useCallback(() => {
  if (previousText !== null) {
    setRawText(previousText)
    setPreviousText(null)
  }
}, [previousText])
```

### 3. Update `src/components/json-input/json-input.tsx`
- Update props: `onFormat` → `onBeautify`, add `onMinify`
- Replace single "Format" button with "Beautify" + "Minify" buttons
- Update keyboard shortcut tooltip

```tsx
// Props change
onBeautify: () => void
onMinify: () => void

// Buttons
<button onClick={onBeautify} disabled={!isValid} title="Beautify (Cmd+Shift+F)">
  Beautify
</button>
<button onClick={onMinify} disabled={!isValid} title="Minify JSON">
  Minify
</button>
```

### 4. Update `src/App.tsx`
- Update JsonInput prop names: `onFormat={formatJson}` → `onBeautify={beautifyJson}`, add `onMinify={minifyJson}`

### 5. Compile check
```bash
npm run build
```

## Todo
- [ ] Install jsonrepair + jsondiffpatch
- [ ] Add minifyJson, undoText, previousText to use-json-state
- [ ] Rename formatJson → beautifyJson
- [ ] Update JsonInput props + buttons
- [ ] Update App.tsx prop names
- [ ] Verify build passes

## Related Files
- `src/hooks/use-json-state.ts` (modify)
- `src/components/json-input/json-input.tsx` (modify)
- `src/components/json-input/json-input.module.css` (no change needed)
- `src/App.tsx` (modify)
- `package.json` (modify via npm install)
