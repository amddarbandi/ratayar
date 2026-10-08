import { Injectable, Logger } from '@nestjs/common';

export interface CoinGeckoItem {
  symbol: string;
  usdPrice: number;
  change24h: number | null;
}

@Injectable()
export class CoinGeckoProvider {
  private readonly logger = new Logger(CoinGeckoProvider.name);
  private readonly ENDPOINT =
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,binancecoin,solana,ripple,tron,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true';

  private readonly SYMBOL: Record<string, string> = {
    bitcoin: 'BTC',
    ethereum: 'ETH',
    tether: 'USDT',
    binancecoin: 'BNB',
    solana: 'SOL',
    ripple: 'XRP',
    tron: 'TRX',
    dogecoin: 'DOGE',
    cardano: 'ADA',
  };

  async fetch(): Promise<CoinGeckoItem[]> {
    try {
      const res = await fetch(this.ENDPOINT);
      if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
      const data = await res.json();
      const out: CoinGeckoItem[] = [];

      for (const [id, sym] of Object.entries(this.SYMBOL)) {
        const d = data[id];
        if (!d) continue;
        out.push({
          symbol: sym,
          usdPrice: d.usd,
          change24h: d.usd_24h_change ?? null,
        });
      }

      this.logger.log(`CoinGecko: fetched ${out.length} items`);
      return out;
    } catch (e: any) {
      this.logger.error(`CoinGecko fetch failed: ${e.message}`);
      return [];
    }
  }
}
