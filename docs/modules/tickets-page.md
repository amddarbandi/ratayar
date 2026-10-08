# Frontend: tickets (user side)

Paths:
- apps/web/src/app/dashboard/tickets/page.tsx           — list + create
- apps/web/src/app/dashboard/tickets/[id]/page.tsx      — thread + reply
Status: done (auth required)

## Purpose

User-facing ticketing. Create, list, read thread, reply. No user-to-user
messaging (backend enforces: users only see their own).

## Data source

- ticketApi.mine()      -> GET  /api/tickets/me
- ticketApi.get(id)     -> GET  /api/tickets/:id
- ticketApi.create(d)   -> POST /api/tickets
- ticketApi.reply(id,b) -> POST /api/tickets/:id/messages

## Create form

- subject * (min 3)
- category: bug | feature | billing | payment | other (default other)
- priority: low | normal | high | urgent (default normal)
- body * (min 5)

## List view

Cards show subject, status pill, category, priority, message count,
last-updated date. Click navigates to detail.

Status pill colors:
  open          -> blue
  answered      -> green
  pending_user  -> yellow
  closed        -> gray

## Detail view

- Header with subject + status
- Message thread: admin messages right-aligned (blue bg), user messages
  left-aligned (white bg)
- Reply textarea hidden when status === 'closed'
- For closed tickets, shows message to open a new one

## Category / priority display

Persian labels for all enum values.

## Next

- Admin panel tickets inbox
- Attachment upload in messages (schema has attachments[])
- SMS notification on admin reply (API-004)
