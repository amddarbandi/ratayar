# Frontend: storage dashboard

Path: apps/web/src/app/dashboard/storage/page.tsx
Status: done (auth required)
Commit: see feat(web): storage dashboard with plan usage

## Purpose

Shows the user their plan limits and current usage with progress bars
and warning colors.

## Data source

- planApi.usage()       -> GET /api/plan/usage
- subscriptionApi.me()  -> GET /api/subscriptions/me (for plan name/price)

## Visuals

- Current plan card (name, maxUploadMB, maxStorageMB)
- Warning banner when storagePercent >= 80 (yellow) or 100 (red)
- Storage gauge (MB used vs plan limit)
- Count bars for documents / obligations / assets

Progress bar colors:
  green  -> below 80%
  yellow -> 80%–99%
  red    -> 100%

For unlimited limits (-1) the bar shows minimal fill and label
"بی‌نهایت".

## CTA

"ارتقای پلن" links to /dashboard/upgrade.

## Backend contract

GET /api/plan/usage returns:
```json
{
  "plan":  { "code","name","maxDocuments","maxObligations","maxAssets",
             "maxStorageMB","maxUploadMB" },
  "usage": { "documents","obligations","assets","storageBytes","storageMB" },
  "limits": { "storagePercent", "storageWarning": "ok"|"high"|"full" }
}

Next
Breakdown by document type (FILES-004)

History chart (storage over time)

Bulk cleanup UI
