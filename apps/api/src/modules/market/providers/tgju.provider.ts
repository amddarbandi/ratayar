import { Injectable, Logger } from '@nestjs/common';

export interface TgjuItem {
  key: string;
  label: string;
  category: 'gold' | 'coin' | 'currency';
  symbol: string;    // short symbol for display
  priceToman: number;
  ts: string;
}

@Injectable()
export class TgjuProvider {
  private readonly logger = new Logger(TgjuProvider.name);
  private readonly ENDPOINT = 'https://call1.tgju.org/ajax.json';

  private readonly MAP: Record<string, { label: string; category: TgjuItem['category']; symbol: string }> = {
    'price_dollar_rl': { label: 'دلار آمریکا', category: 'currency', symbol: 'USD' },
    'price_eur':       { label: 'یورو',        category: 'currency', symbol: 'EUR' },
    'price_gbp':       { label: 'پوند انگلیس', category: 'currency', symbol: 'GBP' },
    'price_aed':       { label: 'درهم امارات', category: 'currency', symbol: 'AED' },
    'price_try':       { label: 'لیر ترکیه',   category: 'currency', symbol: 'TRY' },
    'geram18':         { label: 'طلای ۱۸ عیار (گرم)', category: 'gold', symbol: 'GOLD18' },
    'geram24':         { label: 'طلای ۲۴ عیار (گرم)', category: 'gold', symbol: 'GOLD24' },
    'mesghal':         { label: 'مثقال طلا',   category: 'gold', symbol: 'MESGHAL' },
    'ons':             { label: 'انس جهانی طلا', category: 'gold', symbol: 'XAU' },
    'sekke-imami':     { label: 'سکه امامی',   category: 'coin', symbol: 'SEKKE_EMAMI' },
    'sekke-bahar':     { label: 'سکه بهار آزادی', category: 'coin', symbol: 'SEKKE_BAHAR' },
    'nim':             { label: 'نیم سکه',     category: 'coin', symbol: 'NIM' },
    'rob':             { label: 'ربع سکه',     category: 'coin', symbol: 'ROB' },
  };

  async fetch(): Promise<TgjuItem[]> {
    try {
      const res = await fetch(this.ENDPOINT, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Ratayar/1.0)' },
      });
      if (!res.ok) throw new Error(`TGJU HTTP ${res.status}`);
      const data = await res.json();
      const current = data?.current || {};
      const out: TgjuItem[] = [];

      for (const [key, meta] of Object.entries(this.MAP)) {
        const raw = current[key];
        if (!raw) continue;
        const priceNum = parseFloat(String(raw.p || '').replace(/,/g, ''));
        if (!isFinite(priceNum) || priceNum <= 0) continue;

        // TGJU returns Rial — convert to Toman by /10
        // Exception: 'ons' is USD per ounce
        const priceToman = key === 'ons' ? priceNum : priceNum / 10;

        out.push({
          key,
          label: meta.label,
          category: meta.category,
          symbol: meta.symbol,
          priceToman,
          ts: raw.ts || new Date().toISOString(),
        });
      }

      this.logger.log(`TGJU: fetched ${out.length} items`);
      return out;
    } catch (e: any) {
      this.logger.error(`TGJU fetch failed: ${e.message}`);
      return [];
    }
  }
}
