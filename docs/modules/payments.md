# Module: payments

Path: apps/api/src/modules/payments/
Status: done (backend only, frontend pending)
Commit: b3d21d0

## Purpose

Card-to-card payment workflow. User uploads a receipt image; a ticket
is auto-created for admins; admin approves or rejects; on approval the
subscription is activated automatically.

ZarinPal integration is intentionally deferred — see ROADMAP BIZ-002.

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/payments | user | submit card-to-card payment with receipt |
| GET  | /api/payments/me | user | own payment history |
| GET  | /api/payments/admin/all | admin | list all (filter by status) |
| POST | /api/payments/admin/:id/approve | admin | approve + activate subscription |
| POST | /api/payments/admin/:id/reject | admin | reject + notify user |

## Upload rules

- Field name: `receipt`
- Max size: 5 MB
- Allowed mime: image/jpeg, image/png, image/webp, application/pdf
- Storage: MinIO, bucket `documents`, key format `receipts/{userId}/{ts}-{hash8}.{ext}`

## Flow

1. User submits plan + months + receipt file.
2. Service validates file, plan, existing-pending (one at a time).
3. Uploads receipt to MinIO.
4. Creates `PaymentRequest` (status=pending).
5. Creates a `Ticket` (category=payment, reference=payment_request).
6. Admin sees ticket in tickets panel or payments admin list.
7. Admin approves:
   - `subscriptions.activate(userId, planId, months)` is called
   - payment status set to approved
   - admin message appended to the ticket
   - ticket closed
8. Admin rejects: same but no subscription change, custom reason.

## Data model

- `PaymentRequest` (userId, planId, amount, receiptKey, status, ...)
- `Ticket` (auto-created, referenceType=payment_request)
- `TicketMessage` (system message on approve/reject)

## Constraints

- Only one pending payment per user.
- Cannot purchase the `free` plan.
- Amount is server-computed: `plan.priceMonthly * months`.
- Months parsed from `amount / priceMonthly` on approval.

## Not yet done

- Admin UI for reviewing payments
- User UI for submitting payments + viewing history
- PDF receipt / invoice generation (BIZ-005)
- SMS notification on approve/reject (API-004)
