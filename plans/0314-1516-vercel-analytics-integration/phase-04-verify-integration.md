# Phase 04: Verify Integration

## Overview

| Property | Value |
|----------|-------|
| Priority | P2 |
| Status | pending |
| Effort | 10m |

## Context

- Verification requires production deployment
- Analytics data delayed 5-10 minutes
- Both technical and dashboard verification needed

## Requirements

### Functional
- Deploy code changes to production
- Verify Analytics component loads
- Confirm page views appear in dashboard

### Non-Functional
- No performance degradation
- No console errors in production

## Implementation Steps

### 1. Deploy to Production

```bash
# Option A: Push to main (auto-deploy)
git add .
git commit -m "feat: add vercel analytics"
git push origin main

# Option B: Manual deploy
vercel --prod
```

### 2. Technical Verification

**Check Network Tab:**
1. Open production URL in browser
2. Open DevTools → Network tab
3. Filter by `"_vercel/insights"`
4. Verify requests to:
   - `/_vercel/insights/view`
   - `/_vercel/insights/event`

**Check Console:**
- No errors related to Analytics
- Development mode message expected only on localhost

### 3. Dashboard Verification

1. Go to Vercel Dashboard → Project → Analytics
2. Wait 5-10 minutes for data processing
3. Verify:
   - Page views appear in graph
   - Top pages listed
   - Device/location breakdown visible

### 4. Functional Test

```bash
# Visit production site multiple times
open https://json-viewer.vercel.app  # adjust URL as needed

# Navigate around the app (SPA)
# Check dashboard for page view updates
```

## Verification Checklist

**Technical:**
- [ ] Build succeeds locally
- [ ] Deployment succeeds on Vercel
- [ ] No console errors in production
- [ ] Network requests to `/_vercel/insights/*` visible

**Dashboard:**
- [ ] Analytics tab shows data
- [ ] Page views counted
- [ ] No error states in dashboard

## Success Criteria

- [ ] Production build and deploy successful
- [ ] Analytics requests visible in network tab
- [ ] Page views appear in Vercel Analytics dashboard
- [ ] No errors in browser console or Vercel logs

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No data in dashboard | Wait 10 mins; verify dashboard enabled |
| Network requests failing | Check CORS; verify Vercel project linked |
| Console errors | Verify import path is `/react` not `/next` |
| Build fails | Check for TypeScript errors; verify package installed |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Data delay | High | Low | Wait 10+ minutes |
| Dashboard not enabled | Low | High | Re-verify Phase 03 |

## Notes

- First deployment may take 2-3 minutes
- Analytics data retention: 1 month (free tier)
- Consider adding Speed Insights for performance metrics

## Completion

Once all success criteria met, the Vercel Analytics integration is complete.
Update project docs if analytics tracking requirements change.
