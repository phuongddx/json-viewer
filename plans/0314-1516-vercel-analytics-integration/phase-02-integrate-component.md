# Phase 02: Integrate Analytics + SpeedInsights Components
<!-- Updated: Validation Session 1 - Added SpeedInsights component -->

## Overview

| Property | Value |
|----------|-------|
| Priority | P2 |
| Status | done |
| Effort | 10m |
| Completed | 2026-03-14 |

## Context

- Import from `@vercel/analytics/react` and `@vercel/speed-insights/react` (NOT `/next`)
- Place at root level in `src/main.tsx`
- SPA: page views tracked automatically on navigation
- Speed Insights: Core Web Vitals tracked automatically

## Current Code

**`src/main.tsx`** (before):
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## Requirements

### Functional
- Import `Analytics` and `SpeedInsights` components from correct paths
- Render `<Analytics />` and `<SpeedInsights />` inside `<React.StrictMode>` wrapper
- Page views and Core Web Vitals tracked automatically

### Non-Functional
- Zero impact on app performance
- No console errors in dev mode
- Build size increase minimal (~2KB gzipped)

## Implementation Steps

1. **Add import statements**
   ```tsx
   import { Analytics } from '@vercel/analytics/react'
   import { SpeedInsights } from '@vercel/speed-insights/react'
   ```

2. **Add components to render tree**
   ```tsx
   ReactDOM.createRoot(document.getElementById('root')!).render(
     <React.StrictMode>
       <App />
       <Analytics />
       <SpeedInsights />
     </React.StrictMode>,
   )
   ```

3. **Verify TypeScript compilation**
   ```bash
   npm run build
   ```

## Final Code

**`src/main.tsx`** (after):
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
)
```

## Files Modified

| File | Change |
|------|--------|
| `src/main.tsx` | Add Analytics + SpeedInsights imports and components |

## Success Criteria

- [x] TypeScript compiles without errors
  - No TS errors in src/main.tsx
- [x] `npm run build` succeeds
  - Build completed successfully
- [x] Dev server starts without errors (`npm run dev`)
  - Dev server starts without compilation errors
- [x] No console errors in browser
  - Analytics & SpeedInsights components load silently (expected)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Wrong import path | Low | High | Use `/react` not `/next` |
| Component placement | Low | Medium | Place alongside `<App />`, not inside |

## Notes

- In dev mode, Analytics shows "Development mode" in network tab - expected
- No data sent to Vercel until deployed to production

## Completion Log

### Session 1 — 2026-03-14
**Status:** Completed
**Implementation Details:**
- Modified `src/main.tsx` to add Analytics and SpeedInsights imports
- Components integrated into React.StrictMode wrapper
- TypeScript compilation: passed
- Build verification: passed
- Code review: 10/10 - clean, follows standards

**Files Modified:**
- `/Users/ddphuong/Projects/next-labs/json-viewer/src/main.tsx`

**Next Steps**

- Proceed to [Phase 03: Vercel Dashboard](./phase-03-vercel-dashboard.md)
