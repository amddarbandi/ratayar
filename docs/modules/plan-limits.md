# Module: plan-limits

Path: apps/api/src/common/plan-limits/
Status: done (backend enforcement live)
Module: @Global() — injectable everywhere without import

## Purpose

Central place for plan-based enforcement. Every module that creates
user-owned resources calls PlanLimitsService before writing to DB.

## Service API

- `getActivePlan(userId)` — returns the plan behind the user's active
  subscription, or the free plan if none. Never returns null.
- `checkObligationLimit(userId)` — throws ForbiddenException if the user
  is at the plan's maxObligations (skipped when -1 = unlimited).
- `checkAssetLimit(userId)` — same for maxAssets.
- `checkDocumentLimit(userId, file)` — 4 checks:
    1. extension against plan.allowedFormats
    2. per-file size against plan.maxUploadMB
    3. document count against plan.maxDocuments
    4. total storage against plan.maxStorageMB
- `getPlanUsage(userId)` — current usage vs plan limits, with a
  warning level (`ok` / `high` at 80% / `full` at 100%) for storage.

## Endpoint

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | /api/plan/usage | user | plan + usage + warning level |

Response shape:

```json
{
  "plan":  { "code", "name", "maxDocuments", "maxObligations", "maxAssets",
             "maxStorageMB", "maxUploadMB", "allowedFormats" },
  "usage": { "documents", "obligations", "assets", "storageBytes", "storageMB" },
  "limits": { "storagePercent", "storageWarning" }
}
Enforcement points
Module	Method	Check called
documents	upload()	checkDocumentLimit
obligations	create()	checkObligationLimit
assets	create()	checkAssetLimit
family	inviteMember/acceptInvite	(existing check via family.maxMembers — not yet migrated to plan)
Unlimited marker
-1 in any max* column means unlimited. The service short-circuits
the count query in that case.

Error response
ForbiddenException (HTTP 403) with a Persian message naming the plan
and the numeric limit, so the frontend can render an "upgrade" CTA.

Not yet done
family member limit enforcement via plan (currently uses family.maxMembers)

frontend upgrade CTA wired to 403 responses

storage top-up purchase (BIZ-008)

rate limiting per plan (BIZ-009)
