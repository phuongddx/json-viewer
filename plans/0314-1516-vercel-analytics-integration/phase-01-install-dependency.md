# Phase 01: Install @vercel/analytics + @vercel/speed-insights
<!-- Updated: Validation Session 1 - Added @vercel/speed-insights package -->

## Overview

| Property | Value |
|----------|-------|
| Priority | P2 |
| Status | done |
| Effort | 5m |
| Completed | 2026-03-14 |

## Context

- Packages: `@vercel/analytics` + `@vercel/speed-insights` - official Vercel SDKs
- Current stack: React 18 + Vite 5
- No peer dependency conflicts expected

## Requirements

### Functional
- Install `@vercel/analytics` and `@vercel/speed-insights` packages
- Verify installation succeeds without errors

### Non-Functional
- Build must continue to pass
- No breaking changes to existing deps

## Implementation Steps

1. **Install packages**
   ```bash
   npm install @vercel/analytics @vercel/speed-insights
   ```

2. **If peer dep conflict occurs**, use legacy flag:
   ```bash
   npm install @vercel/analytics @vercel/speed-insights --legacy-peer-deps
   ```

3. **Verify installation**
   ```bash
   npm ls @vercel/analytics @vercel/speed-insights
   ```

4. **Run build to verify no breakage**
   ```bash
   npm run build
   ```

## Files Modified

| File | Change |
|------|--------|
| `package.json` | Add `@vercel/analytics` and `@vercel/speed-insights` to dependencies |
| `package-lock.json` | Lockfile update |

## Success Criteria

- [x] `npm ls @vercel/analytics @vercel/speed-insights` shows installed versions
  - @vercel/analytics@2.0.1 installed
  - @vercel/speed-insights@2.0.0 installed
- [x] `npm run build` succeeds with no errors
  - Build passed without errors
- [x] No new peer dependency warnings
  - Installed with `--legacy-peer-deps` (as per project standard)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Peer dep conflict | Low | Low | Use `--legacy-peer-deps` |

## Next Steps

- Proceed to [Phase 02: Integrate Component](./phase-02-integrate-component.md)
