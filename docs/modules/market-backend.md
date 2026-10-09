# Backend: market module

Path: apps/api/src/modules/market/
Status: done (backend complete)

## Providers

| Provider | Source | Data |
|---|---|---|
| TgjuProvider | call1.tgju.org/ajax.json | currency, gold, coin (Rial -> Toman /10) |
| WallexProvider | api.wallex.ir/v1/markets | crypto in Toman |
| CoinGeckoProvider | api.coingecko.com | crypto in USD |

## Endpoints

- GET /api/market/prices              — full payload (cached 60s)
- GET /api/market/history/:symbol     — time-series from PriceSnapshot
  query: ?days=30 (1..365)

## Cache

RedisService key `market:prices` TTL 60s.
`getPrices(useCache=true)` — cache first; `getPrices(false)` forces fresh.
MarketTasks cron refreshes every 60s proactively.

## Snapshots

Table PriceSnapshot (symbol, priceToman, priceUsd, change24h, ts).
Index (symbol, ts).

MarketTasks cron writes snapshots every 5 minutes.
History endpoint reads from this table.

## Schedule

- EVERY_MINUTE  -> getPrices(false)   (keeps cache warm)
- */5 * * * *   -> writeSnapshots()    (keeps history light)

## Not yet

- Alerts (PRICE-007)
- 60-minute intraday snapshots (only 5-min today)
