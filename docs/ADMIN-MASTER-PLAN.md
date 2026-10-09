# Admin Master Plan — Full Platform Control

> **User directive 2026-10-10:** The admin panel must give complete
> control over the entire platform. Nothing escapes oversight.

## Vision

A single admin surface where the operator can see, control, and audit
every entity on the platform: users, families, plans, subscriptions,
payments, tickets, documents, obligations, notifications, settings,
content, analytics, and system health.

Mobile-first (360px) with the same design system as the user dashboard.

## Sections (target: 18 pages)

### GROUP A — Overview
| # | Path | Purpose |
|---|---|---|
| 1 | /admin | KPIs, live charts, recent activity, alerts |

### GROUP B — Users & Families
| # | Path | Purpose |
|---|---|---|
| 2 | /admin/users | list, search, filter, edit, role, ban, impersonate |
| 3 | /admin/users/[id] | full user profile: usage, sessions, payments, tickets |
| 4 | /admin/families | list all families, members, plan |
| 5 | /admin/families/[id] | family detail + force remove member |

### GROUP C — Business
| # | Path | Purpose |
|---|---|---|
| 6 | /admin/plans | (exists) plan CRUD |
| 7 | /admin/subscriptions | active / expiring / cancelled, force extend |
| 8 | /admin/payments | (exists) approve / reject / refund |
| 9 | /admin/revenue | MRR, ARR, revenue charts by month/plan |
| 10 | /admin/invoices | all invoices (PDF), resend, mark paid |

### GROUP D — Content Oversight
| # | Path | Purpose |
|---|---|---|
| 11 | /admin/documents | all user documents, delete, storage stats |
| 12 | /admin/obligations | all obligations, bulk delete |
| 13 | /admin/tickets | (exists) inbox, macros, assign |
| 14 | /admin/notifications | queue, sent log, retry failed |

### GROUP E — Communication
| # | Path | Purpose |
|---|---|---|
| 15 | /admin/broadcast | SMS / push / in-app to: all / plan / segment |
| 16 | /admin/messages | per-user direct message from admin |

### GROUP F — System & Governance
| # | Path | Purpose |
|---|---|---|
| 17 | /admin/settings | platform config, card number, feature flags |
| 18 | /admin/audit-log | every admin action recorded |
| 19 | /admin/health | API/DB/Redis/MinIO status, cron jobs |
| 20 | /admin/backup | export DB snapshot, download |

### GROUP G — Advanced
| # | Path | Purpose |
|---|---|---|
| 21 | /admin/analytics | DAU/MAU, retention, feature usage heatmap |
| 22 | /admin/abuse | blocked IPs/phones, rate-limit log |
| 23 | /admin/content | FAQ, calendar events, terms versions |
| 24 | /admin/api-keys | external integration keys |

## Backend additions needed

### Models
- AuditLog (actorId, action, target, targetId, meta, ip, ua, ts)
- AdminNote (userId, authorId, body, ts)
- Broadcast (channel, audience, body, sentAt, sentCount, status)
- PlatformSetting (key, value Json, updatedBy, ts)
- FeatureFlag (key, enabled, rolloutPct, audience)
- BlockedIp (ip, reason, until, ts)
- ApiKey (name, hash, scopes, lastUsed, createdAt)

### Endpoints (new)
- GET  /api/admin/overview         KPIs
- GET  /api/admin/users            list, search, filter, paginate
- GET  /api/admin/users/:id        full profile
- PATCH /api/admin/users/:id       edit (name, role, status)
- POST /api/admin/users/:id/ban
- POST /api/admin/users/:id/unban
- POST /api/admin/users/:id/reset-password
- POST /api/admin/users/:id/impersonate (returns short-lived JWT)
- GET  /api/admin/users/:id/sessions
- DELETE /api/admin/users/:id/sessions
- GET  /api/admin/families
- GET  /api/admin/families/:id
- DELETE /api/admin/families/:id/members/:userId
- GET  /api/admin/subscriptions    filter by status/expiry
- POST /api/admin/subscriptions/:id/extend  { months }
- POST /api/admin/subscriptions/:id/cancel
- POST /api/admin/payments/:id/refund
- GET  /api/admin/revenue          by month / plan
- GET  /api/admin/audit-log        paginated
- GET  /api/admin/broadcasts
- POST /api/admin/broadcasts       create + send
- GET  /api/admin/settings
- PATCH /api/admin/settings/:key
- GET  /api/admin/flags
- PATCH /api/admin/flags/:key
- POST /api/admin/blocks/ip
- DELETE /api/admin/blocks/ip/:ip
- GET  /api/admin/health           extended with cron + queue
- POST /api/admin/backup           generate dump
- GET  /api/admin/analytics/dau    time series
- GET  /api/admin/analytics/feature-usage
- POST /api/admin/documents/:id/delete
- POST /api/admin/obligations/bulk-delete

### Audit log wiring
Every admin write action logs: actorId, action, target, targetId,
meta, ip, ua. Auto via interceptor + @Audited() decorator.

## Roles

- `admin`     — full access
- `support`   — users read, tickets write, no billing
- `billing`   — payments, subscriptions, revenue
- `analyst`   — read-only on all, no writes

Currently only `admin` exists. Extend in Phase 2.

## Mobile-first

Every admin page must pass the MOBILE-FIRST.md audit:
- 360px no horizontal scroll
- tables -> card layout on mobile
- 44px tap targets
- drawer navigation on md, bottom bar on phones

## Delivery order

- **P1 Foundation**  : AuditLog, /admin/overview KPIs, health endpoint
- **P2 Users**       : /admin/users, [id], ban, reset-password, impersonate
- **P3 Business**    : subscriptions, revenue, refunds
- **P4 Content**     : documents, obligations, notifications oversight
- **P5 Comms**       : broadcast, direct message
- **P6 System**      : settings, flags, audit-log page, backup
- **P7 Advanced**    : analytics, abuse, content, api-keys

Priority: P1+P2 first (deliver user-control panel), then P3, then rest.

Last updated: 2026-10-10
