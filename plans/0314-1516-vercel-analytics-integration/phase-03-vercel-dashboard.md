# Phase 03: Enable Analytics in Vercel Dashboard

## Overview

| Property | Value |
|----------|-------|
| Priority | P2 |
| Status | pending |
| Effort | 5m |

## Context

- Vercel Web Analytics requires manual enablement per project
- Free tier includes 1M events/month
- No code changes - dashboard configuration only

## Requirements

### Functional
- Enable Web Analytics in Vercel project settings
- Verify analytics data flows after deployment

### Non-Functional
- No code changes required
- Takes effect immediately

## Implementation Steps

1. **Navigate to Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select the `json-viewer` project

2. **Enable Web Analytics**
   - Click **Analytics** tab in project sidebar
   - Click **Enable Web Analytics** button
   - Confirm enablement

3. **Verify Settings**
   - Check that "Web Analytics" shows as "Active"
   - Note: Speed Insights may also be enabled (optional)

4. **Deploy to Apply**
   - Push changes to main branch (triggers auto-deploy)
   - Or manually trigger deployment: `vercel --prod`

## Dashboard Checklist

- [ ] Analytics tab visible in project sidebar
- [ ] Web Analytics status: Active
- [ ] Project deployed after enablement

## Success Criteria

- [ ] Analytics dashboard accessible
- [ ] Status shows "Active" or "Enabled"
- [ ] No billing warnings (free tier sufficient)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Analytics tab missing | Low | High | Check project permissions |
| Billing required | Low | Low | Free tier covers 1M events |

## Notes

- Data appears 5-10 minutes after first page visits
- Can enable Speed Insights simultaneously (optional)

## Next Steps

- Proceed to [Phase 04: Verify Integration](./phase-04-verify-integration.md)
