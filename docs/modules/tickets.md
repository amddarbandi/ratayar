# Module: tickets

Path: apps/api/src/modules/tickets/
Status: done (backend only, frontend pending)
Commit: b3ee2f3

## Purpose

User <-> admin ticketing. Users cannot message each other. Payment
requests automatically create tickets so admins see them in one inbox.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/tickets | user | create ticket |
| GET  | /api/tickets/me | user | list own tickets |
| GET  | /api/tickets/:id | user/admin | full thread (owner or admin) |
| POST | /api/tickets/:id/messages | user/admin | reply |
| GET  | /api/tickets/admin/all | admin | list all (filter by status) |
| POST | /api/tickets/admin/:id/messages | admin | admin reply |
| PATCH | /api/tickets/admin/:id/status | admin | set status + optional note |

## Status flow


## Categories

bug | feature | billing | payment | other

## Priorities

low | normal | high | urgent

## Access rules

- Users can only GET / reply to their own tickets.
- Admin endpoints require `role === 'admin'` (RolesGuard).
- Closed tickets reject new messages.
- `referenceType` + `referenceId` link payment tickets back to the payment.

## Data model

- `Ticket` — subject, category, priority, status, reference
- `TicketMessage` — body, senderRole, optional attachments

## Not yet done

- User UI: create + list + reply
- Admin UI: inbox + filters + reply
- SMS/push notification on admin reply (API-004)
- File attachments in messages (schema has `attachments` array, UI pending)
