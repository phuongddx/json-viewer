---
title: "Vercel Analytics Integration"
description: "Add page view analytics and speed insights to json-viewer via @vercel/analytics and @vercel/speed-insights"
status: in_progress
priority: P2
effort: 30m
branch: main
tags: [analytics, vercel, monitoring]
created: 2026-03-14
last_updated: 2026-03-14
---

## Overview

Integrate Vercel Analytics and Speed Insights into the json-viewer SPA to track page views and Core Web Vitals automatically. Simple integration requiring two dependencies and two component additions.

## Phases

| Phase | Description | Status | Effort |
|-------|-------------|--------|--------|
| [01](./phase-01-install-dependency.md) | Install @vercel/analytics + @vercel/speed-insights | done | 5m |
| [02](./phase-02-integrate-component.md) | Add Analytics + SpeedInsights components | done | 10m |
| [03](./phase-03-vercel-dashboard.md) | Enable in Vercel dashboard | pending | 5m |
| [04](./phase-04-verify-integration.md) | Verify and test | pending | 10m |

## Dependencies

- Vercel deployment (already set up)
- No env vars needed - auto-detected

## Key Decisions

1. **Import path**: Use `@vercel/analytics/react` and `@vercel/speed-insights/react` (NOT `/next`) for Vite/React SPA
2. **Component placement**: `src/main.tsx` - root level, alongside `<App />`
3. **Page views**: Automatic - no manual `track()` calls needed
4. **Speed Insights**: Automatic Core Web Vitals tracking via `<SpeedInsights />`
5. **Install strategy**: Try `npm install` first, fall back to `--legacy-peer-deps` only if needed

## Files to Modify

- `package.json` - add dependencies
- `src/main.tsx` - add `<Analytics />` and `<SpeedInsights />` components

## Success Criteria

- [ ] Package installed, no peer dep conflicts
- [ ] Build succeeds
- [ ] Analytics visible in Vercel dashboard after deployment
- [ ] Page views tracked on route changes

## Risks

| Risk | Mitigation |
|------|------------|
| Peer dep conflict | Use `--legacy-peer-deps` if needed |
| No data in dashboard | Wait 5-10 mins; verify dashboard enabled |

## Notes

- Custom events (`track()`) require Pro/Enterprise - out of scope
- Local dev shows "Development mode" in network tab - expected

## Validation Log

### Session 1 — 2026-03-14
**Trigger:** Pre-implementation plan validation
**Questions asked:** 4

#### Questions & Answers

1. **[Architecture]** The plan places `<Analytics />` in src/main.tsx alongside `<App />`. An alternative is placing it inside App.tsx. Where should it go?
   - Options: src/main.tsx (Recommended) | src/App.tsx
   - **Answer:** src/main.tsx
   - **Rationale:** Cleaner separation — analytics is infrastructure, not app logic

2. **[Scope]** Vercel also offers Speed Insights (Core Web Vitals tracking) via @vercel/speed-insights. Include it now alongside Analytics?
   - Options: Skip for now (Recommended) | Add Speed Insights too
   - **Answer:** Add Speed Insights too
   - **Rationale:** Minimal extra effort (~1 import + 1 component). Gets performance metrics in dashboard immediately

3. **[Assumptions]** The project already uses --legacy-peer-deps (commit 95b8b05). Should we default to that flag for the install step?
   - Options: Always use --legacy-peer-deps (Recommended) | Try without first
   - **Answer:** Try without first
   - **Rationale:** Only fall back to --legacy-peer-deps if plain npm install fails

4. **[Scope]** Phase 03 (enable in Vercel dashboard) and Phase 04 (verify) are manual steps. Should they remain in the plan or be trimmed to a checklist note?
   - Options: Keep as phases (Recommended) | Merge into a checklist
   - **Answer:** Keep as phases
   - **Rationale:** Explicit tracking useful for someone else following the plan

#### Confirmed Decisions
- Placement: src/main.tsx — infrastructure-level concern
- Speed Insights: included — low effort, high value
- Install: try clean install first — only fallback to legacy flag
- Manual phases: keep as separate phases — better traceability

#### Action Items
- [x] Update Phase 01 to include @vercel/speed-insights
- [x] Update Phase 02 to include SpeedInsights component
- [x] Update plan.md overview and key decisions

#### Impact on Phases
- Phase 01: Add `@vercel/speed-insights` to install step
- Phase 02: Add `SpeedInsights` import and component to code
