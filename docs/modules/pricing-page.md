# Frontend: pricing page

Path: apps/web/src/app/pricing/page.tsx
Status: done (public, no auth required)
Commit: see feat(web): public pricing page

## Purpose

Public page that renders all active plans from `GET /api/plans`.
First entry point for monetization. No login required.

## Components

- `PlanCard` (apps/web/src/components/plans/plan-card.tsx)
  - Displays: name, description, price, members, obligations, assets,
    documents, storage, upload limit
  - `-1` rendered as "بی‌نهایت"
  - `isPopular` shows "پیشنهاد ویژه" badge
  - CTA: `شروع رایگان` for free plan, `انتخاب و ارتقا` for paid

## Data source

`plansApi.list()` in `lib/api.ts` -> `GET /api/plans`
(public endpoint, no bearer required)

## Next step

CTA is currently a no-op. Next commit will:
- redirect logged-in users to /dashboard/upgrade?plan=CODE
- redirect guests to /login
