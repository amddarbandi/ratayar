# Frontend: admin payments + tickets

Paths:
- apps/web/src/app/admin/payments/page.tsx         — approve/reject
- apps/web/src/app/admin/tickets/page.tsx          — inbox list
- apps/web/src/app/admin/tickets/[id]/page.tsx     — thread + reply + status
Status: done

## Payments

Tabs: pending | approved | rejected (?status= query)
Each card shows:
- plan name, user phone + name
- amount (RTL formatted)
- method, tracking code, created date, reviewed date
- receipt link (opens receiptKey stream)
- approve/reject buttons (pending only)

Modal asks for optional note. Approve -> activates subscription +
closes auto-ticket (backend). Reject -> closes auto-ticket with reason.

## Tickets inbox

Tabs: all | open | answered | pending_user | closed
Each row: subject, user phone, payment badge if referenceType
=payment_request, status pill, priority, message count, last update.

## Ticket detail

- Header: subject + user phone + status
- Status change panel: pick new status + optional note
- Messages: admin right-aligned (purple), user left-aligned (white)
- Reply form (hidden when closed)

## Security fix included (SEC-016)

PlansController had only JwtAuthGuard on admin endpoints — any logged-in
user could create/update/deactivate plans. Now all four admin endpoints
require RolesGuard + @Roles('admin'):

- GET    /api/plans/admin/all
- POST   /api/plans
- PATCH  /api/plans/:id
- DELETE /api/plans/:id

Verified: tsc + build pass; API restarted clean.
