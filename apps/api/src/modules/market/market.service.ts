import { Injectable, Logger } from '@nestjs/common';
import { TgjuProvider } from './providers/tgju.provider';
import { WallexProvider } from './providers/wallex.provider';
import { CoinGeckoProvider } from './providers/coingecko.provider';

export interface MarketItem {
  key: string;
  symbol: string;
  label: string;
  category: 'gold' | 'coin' | 'currency' | 'crypto';
  priceToman: number | null;
  priceUsd: number | null;
  change24h: number | null;
  ts: string | null;
}

@Injectable()
export class MarketService {
  private readonly logger = new Logger(MarketService.name);

  constructor(
    private readonly tgju: TgjuProvider,
    private readonly wallex: WallexProvider,
    private readonly coingecko: CoinGeckoProvider,
  ) {}

  async getPrices() {
    const [tgju, wallex, gecko] = await Promise.all([
      this.tgju.fetch(),
      this.wallex.fetch(),
      this.coingecko.fetch(),
    ]);

    // USD reference from TGJU and Wallex USDT (average)
    const tgjuUsd = tgju.find((t) => t.key === 'price_dollar_rl');
    const wallexUsdt = wallex.find((w) => w.symbol === 'USDT');
    const usdToman = this.pickUsdToman(tgjuUsd?.priceToman, wallexUsdt?.priceToman);

    const items: MarketItem[] = [];

    // TGJU: gold, coin, currency
    for (const t of tgju) {
      const isOunce = t.key === 'ons';
      const priceToman = isOunce
        ? usdToman
          ? t.priceToman * usdToman
          : null
        : t.priceToman;
      const priceUsd = isOunce
        ? t.priceToman
        : usdToman
          ? +(t.priceToman / usdToman).toFixed(2)
          : null;
      items.push({
        key: t.key,
        symbol: t.symbol,
        label: t.label,
        category: t.category,
        priceToman,
        priceUsd,
        change24h: null,
        ts: t.ts,
      });
    }

    // Crypto: Wallex has Toman, CoinGecko has USD
    const geckoBySym = new Map(gecko.map((g) => [g.symbol, g]));
    for (const w of wallex) {
      const g = geckoBySym.get(w.symbol);
      items.push({
        key: `wallex_${w.key}`,
        symbol: w.symbol,
        label: w.label,
        category: 'crypto',
        priceToman: w.priceToman,
        priceUsd: g?.usdPrice ?? null,
        change24h: w.change24h ?? g?.change24h ?? null,
        ts: new Date().toISOString(),
      });
    }

    return {
      usdToman,
      items,
      fetchedAt: new Date().toISOString(),
    };
  }

  private pickUsdToman(tgju?: number, wallex?: number): number | null {
    // Prefer average if both are close
    if (tgju && wallex && Math.abs(tgju - wallex) / tgju < 0.05) {
      return Math.round((tgju + wallex) / 2);
    }
    // Otherwise prefer TGJU (official-ish)
    return tgju ? Math.round(tgju) : wallex ? Math.round(wallex) : null;
  }
}
