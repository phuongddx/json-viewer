# Code Review Report: JSON Viewer Web Application

**Reviewer:** code-reviewer agent
**Date:** 2026-03-14
**Scope:** Security, Performance, Code Quality, Error Handling

---

## Scope

- **Files Reviewed:**
  - `src/App.tsx` (96 lines)
  - `src/components/toolbar/toolbar.tsx` (79 lines)
  - `src/components/json-input/json-input.tsx` (84 lines)
  - `src/components/json-viewer/json-viewer-component.tsx` (58 lines)
  - `src/components/layout/layout.tsx` (33 lines)
  - `src/components/file-drop-zone/file-drop-zone.tsx` (163 lines)
  - `src/hooks/use-json-state.ts` (59 lines)
  - `src/hooks/use-file-import.ts` (166 lines)
- **Total LOC:** ~735 lines
- **TypeScript Check:** Passing (no errors)
- **Linting:** Not configured (eslint not installed)

---

## Overall Assessment

Well-structured React + TypeScript application with clean component separation. Core functionality works correctly. Several MODERATE issues around theme synchronization and edge cases need attention. No CRITICAL security vulnerabilities found.

---

## CRITICAL Issues

**None identified.**

The application:
- Uses `JSON.parse()` safely with try-catch (no eval or Function constructor)
- No user input rendered as HTML (all React auto-escaping)
- No external API calls or data exfiltration
- File input restricted to `.json` and `application/json`

---

## IMPORTANT Issues (High Priority)

### 1. Theme State Desynchronization

**Location:** `src/components/toolbar/toolbar.tsx` lines 17, 30-34 and `src/App.tsx` lines 12, 24-30

**Problem:** Two separate theme states exist:
- `App.tsx` manages `[theme, setTheme]` and applies to `document.documentElement`
- `toolbar.tsx` manages independent `[isDark, setIsDark]` state

Both write to `data-theme` attribute independently. Clicking App's theme button does NOT update Toolbar's internal state, causing UI text mismatch ("Light Mode" / "Dark Mode" button label becomes stale).

**Evidence:**
```tsx
// App.tsx:12
const [theme, setTheme] = useState<Theme>('dark')

// toolbar.tsx:17
const [isDark, setIsDark] = useState(true)  // Independent, not synced
```

**Impact:** User confusion, inconsistent UI state.

**Recommendation:** Lift theme state to App level, pass down via props or context. Remove local state in Toolbar.

---

### 2. Large File Handling Without Size Limit

**Location:** `src/hooks/use-file-import.ts` lines 37-62

**Problem:** No file size validation before reading. Users can drop multi-GB files causing:
- Browser memory exhaustion
- UI freeze during `JSON.parse()` on massive strings
- Potential tab crash

**Evidence:**
```tsx
// No size check before:
const text = await readFileAsText(file)  // Reads entire file into memory
const result = parseJson(text)           // Parses entire string
```

**Impact:** Denial of service, poor UX, browser crash.

**Recommendation:** Add configurable max file size (e.g., 10MB). Show error if exceeded:
```tsx
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_FILE_SIZE) {
  setError('File too large. Maximum size is 10MB.');
  return;
}
```

---

### 3. Expand/Collapse All Implementation Fragile

**Location:** `src/components/json-viewer/json-viewer-component.tsx` lines 18-34

**Problem:** Expand/Collapse relies on querying DOM elements by `aria-label` text matching. This breaks if `@textea/json-viewer` changes their accessibility labels.

**Evidence:**
```tsx
const expandButtons = viewerRef.current?.querySelectorAll('[aria-label*="expand"], [aria-label*="Expand"]')
```

**Impact:** Feature silently breaks on library updates.

**Recommendation:** Check if `@textea/json-viewer` exposes programmatic API for expand/collapse. If not, add fallback error handling and document the dependency on internal DOM structure.

---

## MODERATE Issues

### 4. Redundant Paste Handler Logic

**Location:** `src/components/file-drop-zone/file-drop-zone.tsx` lines 30-62 and `src/hooks/use-file-import.ts` lines 95-117

**Problem:** Paste handling duplicated:
- `use-file-import.ts` exports `loadFromPaste` function
- `file-drop-zone.tsx` implements its own `handlePaste` inline, ignoring `loadFromPaste`

**Evidence:**
```tsx
// use-file-import.ts exports this but it's unused:
loadFromPaste: (e: ClipboardEvent) => void;

// file-drop-zone.tsx reimplements:
const handlePaste = useCallback((e: ClipboardEvent) => { ... }, [...]);
```

**Impact:** Dead code, maintenance burden, potential inconsistency.

**Recommendation:** Either use `loadFromPaste` from the hook or remove it from the public interface.

---

### 5. Silent Failure on Clipboard JSON Parse

**Location:** `src/components/file-drop-zone/file-drop-zone.tsx` lines 54-59

**Problem:** Invalid JSON in clipboard is silently ignored with no user feedback.

**Evidence:**
```tsx
try {
  const parsed = JSON.parse(text.trim());
  onDataLoaded(parsed);
} catch {
  // Invalid JSON in clipboard, ignore silently
}
```

**Impact:** User confusion when paste appears to do nothing.

**Recommendation:** Show brief toast/notification for invalid clipboard JSON, or at least log to console in development.

---

### 6. Duplicated Theme Toggle Logic

**Location:** `src/App.tsx` lines 28-30 and `src/components/toolbar/toolbar.tsx` lines 30-34

**Problem:** Same logic implemented twice:
```tsx
// App.tsx
setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))

// toolbar.tsx
const newTheme = isDark ? 'light' : 'dark'
setIsDark(!isDark)
document.documentElement.setAttribute('data-theme', newTheme)
```

**Impact:** Code duplication, maintenance burden.

---

### 7. Error State Not Cleared on New Input

**Location:** `src/components/file-drop-zone/file-drop-zone.tsx`

**Problem:** After an error, loading new data may not clear the error styling immediately (depends on race between `loadFromFile` and render).

**Evidence:** Error class applied via `${error ? styles.error : ''}` but `clear()` must be called explicitly.

**Recommendation:** Clear error state automatically when starting new file load.

---

### 8. Missing ESLint Configuration

**Location:** `package.json`

**Problem:** ESLint referenced in scripts but not installed as devDependency.

**Impact:** No static analysis, potential issues undetected.

**Recommendation:** Add ESLint and TypeScript ESLint packages, or remove lint script.

---

## Edge Cases Found

1. **Empty file accepted:** Empty `.json` file parses as `null` and shows "JSON loaded successfully" - confusing UX
2. **Non-JSON text file with `.json` extension:** `text/plain` MIME + `.json` extension passes validation, fails parse with generic error
3. **Circular reference in expand/collapse:** If `@textea/json-viewer` adds expand buttons dynamically during expand, could infinite loop
4. **Concurrent file operations:** Rapid file drops may cause race conditions in state updates

---

## Positive Observations

1. **Clean component architecture:** Separation of concerns between layout, input, viewer, file handling
2. **TypeScript strict mode:** Proper typing throughout, `unknown` for parsed JSON
3. **Accessibility:** ARIA labels on buttons, keyboard navigation support
4. **Error boundaries:** Try-catch around all async operations
5. **Memory efficiency:** `useCallback` and `useMemo` used appropriately
6. **CSS custom properties:** Good theming foundation via CSS variables
7. **File input reset:** `e.target.value = ''` allows re-selecting same file

---

## Security Analysis

| Area | Status | Notes |
|------|--------|-------|
| XSS | PASS | No `dangerouslySetInnerHTML`, React auto-escapes |
| Injection | PASS | No eval, Function constructor, or HTML injection |
| File Upload | PASS | Client-side only, proper type validation |
| Data Exposure | PASS | No external network requests |
| DoS | MODERATE | No file size limit (see Issue #2) |
| Content Security | N/A | No CSP headers (dev server) |

---

## Recommended Actions (Priority Order)

1. **[HIGH]** Fix theme state synchronization - lift state to App level
2. **[HIGH]** Add file size limit (10MB max recommended)
3. **[MEDIUM]** Remove duplicate paste handling code
4. **[MEDIUM]** Add user feedback for invalid clipboard JSON
5. **[MEDIUM]** Document or improve expand/collapse DOM dependency
6. **[LOW]** Configure ESLint or remove lint script
7. **[LOW]** Handle empty file edge case with specific message

---

## Metrics

| Metric | Value |
|--------|-------|
| Type Coverage | 100% (TypeScript strict) |
| Test Coverage | 0% (no tests found) |
| Linting Issues | Unknown (ESLint not configured) |
| Security Vulnerabilities | 0 Critical, 0 High |
| Code Smells | 4 Moderate |

---

## Unresolved Questions

1. Should the application support JSONC (JSON with comments) format?
2. What is the expected maximum JSON depth for tree view performance?
3. Should theme preference persist to localStorage?
4. Is there a requirement for URL-based JSON loading (would need CORS/Security review)?
