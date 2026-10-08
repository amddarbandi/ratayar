# Backend: market module

Path: apps/api/src/modules/market/
Status: done (backend only, frontend pending)

## Providers

| Provider | Source | Data |
|---|---|---|
| TgjuProvider | call1.tgju.org/ajax.json | currency, gold, coin (Rial -> Toman /10) |
| WallexProvider | api.wallex.ir/v1/markets | crypto in Toman |
| CoinGeckoProvider | api.coingecko.com | crypto in USD (reference) |

All sources tested from Iran on 2026-10-09:
- TGJU works (real market reference)
- Wallex works
- CoinGecko works
- Bonbast fails (Cloudflare)
- Binance fails (blocked)
- exchangerate.host requires key (skipped)

## Endpoint

GET /api/market/prices  (JWT required)

Returns:
{
  usdToman: number,             // averaged TGJU + Wallex USDT
  fetchedAt: ISO string,
  items: [{
    key, symbol, label, category,
    priceToman: number | null,
    priceUsd: number | null,
    change24h: number | null,
    ts: ISO string | null
  }]
}

## Categories

- currency: USD, EUR, GBP, AED, TRY
- gold: GOLD18, GOLD24, MESGHAL, XAU (ounce)
- coin: SEKKE_EMAMI, SEKKE_BAHAR, NIM, ROB
- crypto: USDT, BTC, ETH, XAUT, BNB, SOL, XRP, TRX, DOGE, ADA

## USD reference

Average of TGJU price_dollar_rl and Wallex USDTTMN when within 5%;
otherwise TGJU wins. This lets all USD prices be computed consistently.

## XAU (gold ounce)

Comes from TGJU as USD. Service multiplies by usdToman to give a
Toman value, and keeps priceUsd as the raw value.

## Not yet

- Redis cache (60s) — currently fetched on each request
- Scheduled job for proactive refresh
- change24h for gold/currency (TGJU doesn't provide)
- Cross-category converter endpoint
