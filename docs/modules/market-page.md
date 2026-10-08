# Frontend: market page

Path: apps/web/src/app/dashboard/market/page.tsx
Status: done

## Purpose

Live market dashboard: gold, coins, currency, crypto.
Auto-refreshes every 60 seconds. Manual refresh button too.

## Data

GET /api/market/prices (JWT) via marketApi.prices()

Shape:
{ usdToman, fetchedAt, items: [{ key, symbol, label, category,
  priceToman, priceUsd, change24h, ts }] }

## UI

- Header with USD hero card (average TGJU + Wallex)
- Filter tabs: all / gold / coin / currency / crypto
- Card grid (1 col mobile, 2 tablet, 3 desktop)
- Each card:
  - symbol badge in category gradient
  - name + symbol (mono)
  - price in Toman (RTL digits)
  - USD reference below
  - 24h change pill (green up / red down)
  - category color glow blob
- framer-motion layout animation on filter change
- Toast on fetch error

## Sidebar

Added /dashboard/market with TrendingUp icon, label 'بازار و قیمت‌ها'
right after 'تبدیل'.

## Not yet

- Sparklines (PRICE-009)
- 30-day detail modal (PRICE-006)
- Price alerts (PRICE-007)
- Cross-category converter widget (PRICE-008)
