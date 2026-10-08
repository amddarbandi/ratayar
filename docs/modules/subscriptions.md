# Module: subscriptions

Path: apps/api/src/modules/subscriptions/
Status: done (backend only, frontend pending)
Commit: b12f8d9

## Purpose

Manages each user's active plan. Auto-provisions the free plan if the
user has no active subscription. Provides the PlanLimitGuard with the
current active plan for a user.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET  | /api/subscriptions/me | user | current active subscription (auto-creates free) |
| GET  | /api/subscriptions/history | user | full subscription history |
| POST | /api/subscriptions/cancel | user | cancel paid plan (falls back to free) |
| GET  | /api/subscriptions/admin/all | admin | list all subscriptions (filter by status) |

## Service API (consumed by other modules)

- `getActiveSubscription(userId)` — returns active sub + plan
- `getActivePlan(userId)` — returns just the plan (for PlanLimitGuard)
- `activate(userId, planId, months)` — called by payments.approve
- `listAll({ status, limit })` — admin listing

## Data model

Consumes:
- `Plan` — plan definition (price, limits, features)
- `Subscription` — user-to-plan linkage over time

## Auto-provisioning

If no `active` subscription exists for a user, `getActiveSubscription`
creates one linked to the `free` plan. This makes the system robust
to users created before plans existed.

## Cancel behaviour

Paid plans can be cancelled. Free plan cannot be cancelled. After
cancellation, the next `getActiveSubscription` call auto-provisions
free again.

## Not yet done

- Frontend "current subscription" card in dashboard
- Renewal flow
- Proration on upgrade/downgrade
