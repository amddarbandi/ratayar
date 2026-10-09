# Backend: admin module

Path: apps/api/src/modules/admin/
Status: P1 foundation done

## Audit infrastructure (common/audit/)

- @Audited({ action, targetType, targetIdFrom })  — decorator
- AuditInterceptor — global; writes on success AND on error
  (action + ".failed"), masks password/token/otp in body
- AuditService — write() + list() with filters
- Wired via APP_INTERCEPTOR in app.module

## AuditLog model

id, actorId, actorPhone, actorRole, action, targetType, targetId,
meta (Json), ip, userAgent, createdAt
Indexes: (actorId, createdAt), (action, createdAt), (targetType, targetId)

## Endpoints

- GET /api/admin/overview                — all KPIs in one payload
- GET /api/admin/audit-log               — paginated, filterable

Both guarded by JwtAuthGuard + RolesGuard + @Roles('admin')

## Overview payload

{
  kpis: {
    users:        { total, active, newThisMonth, growthPct },
    revenue:      { thisMonthToman, lastMonthToman, growthPct },
    subscriptions:{ active, pendingPayments },
    content:      { documents, storageBytes, storageMB, obligations, families },
    support:      { openTickets }
  },
  planBreakdown: [{ planId, code, name, count }],
  recentAudit:   [...10 latest]
}

## Planned tasks (see ADMIN-MASTER-PLAN.md)

P2 users, P3 business, P4 content, P5 comms, P6 system, P7 advanced.
