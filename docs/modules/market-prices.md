# Market Prices (بازار و قیمت‌ها) — Architecture

Status: PLANNED (PRICE-001..010)
Priority: HIGH (user directive 2026-10-09)
Separate top-level menu (not part of converters).

## Purpose

Live market prices for gold, currencies, coins, and crypto, plus a
conversion calculator integrated with them.

## Categories

1. **طلا و سکه** (Gold & Coins)
   - طلای ۱۸ عیار (gram) — Iranian market
   - طلای ۲۴ عیار (gram)
   - سکه امامی، سکه بهار آزادی، نیم سکه، ربع سکه
   - انس جهانی طلا (USD/oz)

2. **ارز** (Currency)
   - دلار آمریکا، یورو، درهم امارات، لیر ترکیه
   - پوند انگلیس، یوان چین، ین ژاپن
   - دلار کانادا، دلار استرالیا

3. **ارز دیجیتال** (Crypto)
   - بیت‌کوین (BTC), اتریوم (ETH), تتر (USDT)
   - بایننس‌کوین (BNB), سولانا (SOL), ریپل (XRP)
   - ترون (TRX), دوج‌کوین (DOGE)

## Data sources (free, no paid API)

| Category | Primary source              | Fallback              |
|----------|-----------------------------|-----------------------|
| Gold/Coins | nerkh.io API or tgju.org (scrape) | bonbast.com           |
| Currency   | bonbast.com or alanchand.com      | exchangerate.host     |
| Crypto     | CoinGecko public API               | Binance public API    |

All sources cached in Redis with 60s TTL. If primary fails, hit
fallback. If both fail, return last cached value with `stale: true`.

## Backend (NestJS)

New module: apps/api/src/modules/market/

Endpoints:
- GET /api/market/prices       — all categories in one payload
- GET /api/market/gold         — gold + coins only
- GET /api/market/currency     — currencies only
- GET /api/market/crypto       — crypto only
- GET /api/market/convert      — ?amount=&from=&to= (cross category)

Redis keys:
  market:gold         (TTL 60s)
  market:currency     (TTL 60s)
  market:crypto       (TTL 60s)

Scheduled job (every 60s) refreshes all caches proactively via
@nestjs/schedule so users never wait on upstream fetch.

## Frontend (Next.js)

Route: /dashboard/market

Sections:
1. Hero stats — top 3 movers (biggest 24h change) with sparklines
2. Category tabs: طلا و سکه / ارز / ارز دیجیتال
3. Card grid per item:
   - name + symbol
   - current price (RTL formatted, تومان or USD)
   - 24h change (% with color)
   - mini sparkline (24h)
   - click -> detail modal with 30-day chart
4. Live converter widget (uses /api/market/convert) — cross-category:
   - مثال: ۱۰ گرم طلا چند دلار؟
   - مثال: ۱۰۰ تتر چند تومان؟
5. Refresh indicator (auto-refreshes every 60s, plus manual button)

Visual system:
- Same dark glass theme
- Category colors: gold=amber, currency=cyan, crypto=purple
- Number displays use Vazirmatn with tabular numbers
- Sparklines rendered inline SVG (no chart library needed for mini)
- Detail modal uses Recharts (already in deps) for 30-day

## Data model (optional caching in DB)

Not required for MVP, but if history is needed later:

model PriceSnapshot {
  id        String   @id @default(uuid()) @db.Uuid
  symbol    String   @db.VarChar(20)
  price     Decimal  @db.Decimal(20, 8)
  change24h Decimal? @db.Decimal(10, 4) @map("change_24h")
  ts        DateTime @default(now())
  @@index([symbol, ts])
  @@map("price_snapshots")
}

Snapshots written by the scheduled job every 5 minutes (not 60s), so
history is lightweight.

## ROADMAP mapping

- PRICE-001 gold proxy           -> market module (gold section)
- PRICE-002 currency proxy       -> market module (currency section)
- PRICE-003 crypto proxy         -> market module (crypto section)
- PRICE-004 Redis cache 60s      -> market.cache.service
- PRICE-005 dashboard widget     -> cards (Phase 2 of PRICE)
- PRICE-006 dedicated page       -> /dashboard/market (this)
- PRICE-007 price alerts         -> later (Phase 2)
- PRICE-008 in-app converter     -> section 4 of page
- PRICE-009 sparkline            -> mini SVG in cards
- PRICE-010 source fallback      -> built into market.providers

## Non-goals

- No trading, no wallet, no portfolio (this is reference only).
- No paid APIs.
- No websocket streaming (60s polling is enough).
