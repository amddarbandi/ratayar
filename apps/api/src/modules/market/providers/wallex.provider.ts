import { Injectable, Logger } from '@nestjs/common';

export interface WallexItem {
  key: string;
  label: string;
  symbol: string;
  priceToman: number;
  change24h: number | null;
}

@Injectable()
export class WallexProvider {
  private readonly logger = new Logger(WallexProvider.name);
  private readonly ENDPOINT = 'https://api.wallex.ir/v1/markets';

  private readonly MAP: Record<string, { label: string; symbol: string }> = {
    USDTTMN:  { label: 'تتر',           symbol: 'USDT' },
    BTCTMN:   { label: 'بیت‌کوین',      symbol: 'BTC' },
    ETHTMN:   { label: 'اتریوم',         symbol: 'ETH' },
    XAUTTMN:  { label: 'تتر گلد',       symbol: 'XAUT' },
    BNBTMN:   { label: 'بایننس‌کوین',    symbol: 'BNB' },
    SOLTMN:   { label: 'سولانا',         symbol: 'SOL' },
    XRPTMN:   { label: 'ریپل',           symbol: 'XRP' },
    TRXTMN:   { label: 'ترون',           symbol: 'TRX' },
    DOGETMN:  { label: 'دوج‌کوین',       symbol: 'DOGE' },
    ADATMN:   { label: 'کاردانو',        symbol: 'ADA' },
  };

  async fetch(): Promise<WallexItem[]> {
    try {
      const res = await fetch(this.ENDPOINT, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ratayar/1.0)' },
      });
      if (!res.ok) throw new Error(`Wallex HTTP ${res.status}`);
      const data = await res.json();
      const symbols = data?.result?.symbols || {};
      const out: WallexItem[] = [];

      for (const [key, meta] of Object.entries(this.MAP)) {
        const s = symbols[key];
        if (!s) continue;
        const price = parseFloat(s.stats?.lastPrice || s.stats?.lastTradePrice || '0');
        if (!isFinite(price) || price <= 0) continue;

        const change = parseFloat(s.stats?.dailyChangePercent || '0');
        out.push({
          key,
          label: meta.label,
          symbol: meta.symbol,
          priceToman: price,
          change24h: isFinite(change) ? change : null,
        });
      }

      this.logger.log(`Wallex: fetched ${out.length} items`);
      return out;
    } catch (e: any) {
      this.logger.error(`Wallex fetch failed: ${e.message}`);
      return [];
    }
  }
}
