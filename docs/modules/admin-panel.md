# Frontend: admin panel

Paths:
- apps/web/src/app/admin/layout.tsx        — admin-only guard + sidebar
- apps/web/src/app/admin/page.tsx          — dashboard
- apps/web/src/app/admin/plans/page.tsx    — plan CRUD
Status: in progress (payments + tickets pages pending)

## Access control

Layout checks `user.role === 'admin'`; non-admins are redirected to
/dashboard. Uses the same auth store as the dashboard layout.

## Admin sidebar

Red-orange theme, distinct from the user dashboard. Items:
- /admin            داشبورد
- /admin/plans      پلن‌ها
- /admin/payments   پرداخت‌ها (pending)
- /admin/tickets    تیکت‌ها (pending)

## Dashboard (/admin)

Three stat cards fetched in parallel:
- Active plans count        (GET /api/plans)
- Pending payments count    (GET /api/payments/admin/all?status=pending)
- Open tickets count        (GET /api/tickets/admin/all?status=open)

Each card links to the relevant page.

## Plans CRUD (/admin/plans)

- Table: code, name, price, users, obligations, documents, storage,
  status, actions
- "پلن جدید" opens a modal with all fields
- Edit opens the same modal pre-filled
- Delete = soft deactivate (DELETE /api/plans/:id)
- `-1` rendered as ∞
- Checkboxes: isActive, isPopular
- allowedFormats edited as comma-separated string

Endpoints:
- GET    /api/plans/admin/all
- POST   /api/plans
- PATCH  /api/plans/:id
- DELETE /api/plans/:id

## Pending

- /admin/payments — approve/reject payment requests
- /admin/tickets  — answer user tickets, change status
