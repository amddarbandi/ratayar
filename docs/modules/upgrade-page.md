# Frontend: upgrade page

Path: apps/web/src/app/dashboard/upgrade/page.tsx
Status: done (auth required)
Commit: see feat(web): upgrade page with receipt upload

## Purpose

Authenticated upgrade flow. User picks a plan, uploads a card-to-card
receipt image, and creates a payment request + auto-ticket for admin.

## Flow

1. On mount: fetch plans + current subscription
2. Preselect plan from ?plan=CODE query (from pricing page CTA)
3. User picks plan (current plan disabled)
4. User sets months (1/2/3/6/12) + optional tracking code + receipt file
5. Submit -> paymentApi.create(FormData)
6. Backend creates PaymentRequest + Ticket (category=payment)
7. Success message; admin approves from admin panel

## File constraints

- accept: image/jpeg, image/png, image/webp, application/pdf
- max: 5 MB (backend enforces)

## States

- loading / error / no plans
- current plan marked "پلن فعلی" and disabled
- selected plan highlighted blue
- success message persists until next submit

## CTA wiring

apps/web/src/components/plans/plan-card.tsx
  CTA -> /dashboard/upgrade?plan=CODE

## Next

- admin panel to approve/reject
- SMS notification on approve (API-004)
- PDF invoice download (BIZ-005)
