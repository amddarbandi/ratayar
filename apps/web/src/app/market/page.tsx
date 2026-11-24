'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { marketApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { PriceSparkline } from '@/components/market/price-sparkline';
import { cn } from '@/lib/utils';
import { fmtPercent } from '@/lib/format';
import { toast } from 'sonner';

interface Item {
  key: string;
  symbol: string;
  label: string;
  category: 'gold' | 'coin' | 'currency' | 'crypto';
  priceToman: number | null;
  priceUsd: number | null;
  change24h: number | null;
  ts: string | null;
}

interface Payload {
  usdToman: number;
  fetchedAt: string;
  items: Item[];
}

const CATEGORIES = [
  { key: 'all', label: 'همه', emoji: '🌐' },
  { key: 'gold', label: 'طلا', emoji: '🥇' },
  { key: 'coin', label: 'سکه', emoji: '🪙' },
  { key: 'currency', label: 'ارز', emoji: '💵' },
  { key: 'crypto', label: 'ارز دیجیتال', emoji: '₿' },
];

const CAT_COLOR: Record<string, string> = {
  gold: 'from-amber-500 to-yellow-500',
  coin: 'from-yellow-500 to-orange-500',
  currency: 'from-cyan-500 to-blue-500',
  crypto: 'from-purple-500 to-fuchsia-500',
};

// CDN برای آیکون‌های واقعی
const CRYPTO_CDN = 'https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/128/color';
const FLAG_CDN = 'https://flagcdn.com/w160';

const IMAGE_ICONS: Record<string, string> = {
  // ارز دیجیتال
  BTC: `${CRYPTO_CDN}/btc.png`,
  ETH: `${CRYPTO_CDN}/eth.png`,
  USDT: `${CRYPTO_CDN}/usdt.png`,
  BNB: `${CRYPTO_CDN}/bnb.png`,
  SOL: `${CRYPTO_CDN}/sol.png`,
  XRP: `${CRYPTO_CDN}/xrp.png`,
  TRX: `${CRYPTO_CDN}/trx.png`,
  DOGE: `${CRYPTO_CDN}/doge.png`,
  ADA: `${CRYPTO_CDN}/ada.png`,
  // فیات (پرچم)
  USD: `${FLAG_CDN}/us.png`,
  EUR: `${FLAG_CDN}/eu.png`,
  GBP: `${FLAG_CDN}/gb.png`,
  AED: `${FLAG_CDN}/ae.png`,
  TRY: `${FLAG_CDN}/tr.png`,
};

const EMOJI_FALLBACK: Record<string, string> = {
  XAUT: '🪙',
  GOLD18: '🥇',
  GOLD24: '🏆',
  MESGHAL: '⚖️',
  XAU: '🪙',
  SEKKE_EMAMI: '👑',
  SEKKE_BAHAR: '🌸',
  NIM: '🪙',
  ROB: '🪙',
};

// ═══════════════════════════════════════════
// SymbolIcon — آیکون هوشمند
// ═══════════════════════════════════════════
function SymbolIcon({ symbol, category }: { symbol: string; category: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  const imageUrl = IMAGE_ICONS[symbol];

  // لایه ۱: تصویر واقعی
  if (imageUrl && !imgFailed) {
    return (
      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden p-1 shrink-0">
        <img
          src={imageUrl}
          alt={symbol}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
          loading="lazy"
        />
      </div>
    );
  }

  // لایه ۲: نقره (اگر روزی به دیتا اضافه شد)
  if (symbol === 'XAG' || symbol === 'SILVER') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-500 flex items-center justify-center shadow-lg shadow-slate-400/30 shrink-0">
        <svg viewBox="0 0 24 24" className="w-7 h-7">
          <path d="M3.5 14.5L6 7h12l2.5 7.5L18 17H6l-2.5-2.5z" fill="#334155" fillOpacity="0.3" />
          <text x="12" y="14.8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#334155">Ag</text>
        </svg>
      </div>
    );
  }

  // لایه ۳: دسته طلا → شمش طلا
  if (category === 'gold') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
        <svg viewBox="0 0 24 24" className="w-7 h-7">
          <path d="M3.5 14.5L6 7h12l2.5 7.5L18 17H6l-2.5-2.5z" fill="#78350f" fillOpacity="0.3" />
          <text x="12" y="14.8" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#78350f">Au</text>
        </svg>
      </div>
    );
  }

  // لایه ۴: دسته سکه → سکه طلا
  if (category === 'coin') {
    return (
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
        <svg viewBox="0 0 24 24" className="w-7 h-7">
          <circle cx="12" cy="12" r="9" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <circle cx="12" cy="12" r="6.5" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
          <text x="12" y="15" textAnchor="middle" fontSize="5" fontWeight="bold" fill="#78350f">IR</text>
        </svg>
      </div>
    );
  }

  // لایه نهایی: ایموجی/متن
  return (
    <div
      className={cn(
        'w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shrink-0',
        CAT_COLOR[category] || 'from-purple-500 to-pink-500',
      )}
    >
      {EMOJI_FALLBACK[symbol] || symbol.slice(0, 2)}
    </div>
  );
}

export default function MarketPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await marketApi.prices();
      setData(res.data);
    } catch (e: any) {
      toast.error('خطا در دریافت قیمت‌ها');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 60000);
    return () => clearInterval(t);
  }, []);

  const items = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data.items;
    return data.items.filter((i) => i.category === filter);
  }, [data, filter]);

  return (
    <div className="relative min-h-screen pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-fuchsia-500 to-purple-500 flex items-center justify-center text-2xl">
                📈
              </div>
              <h1 className="text-3xl font-bold text-white">بازار و قیمت‌ها</h1>
            </div>
            <p className="text-white/50">
              نرخ لحظه‌ای طلا، سکه، ارز و ارز دیجیتال — به‌روزرسانی هر ۶۰ ثانیه
            </p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            به‌روزرسانی
          </button>
        </div>

        {data && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <div className="text-xs text-white/50 mb-1">دلار آمریکا</div>
                  <div className="text-4xl font-black text-white" dir="ltr">
                    {data.usdToman.toLocaleString('fa-IR')}
                    <span className="text-lg text-white/50 mr-2">تومان</span>
                  </div>
                </div>
                <div className="text-xs text-white/40">
                  آخرین به‌روزرسانی: {new Date(data.fetchedAt).toLocaleTimeString('fa-IR')}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border',
                filter === c.key
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border-white/10',
              )}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {items.map((it, i) => (
                <PriceCard key={it.key} item={it} delay={i * 0.03} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PriceCard({ item, delay }: { item: Item; delay: number }) {
  const isUp = (item.change24h ?? 0) >= 0;
  const hasChange = item.change24h !== null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay }}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5 hover:border-white/20 transition-all"
    >
      <div
        className={cn(
          'absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br',
          CAT_COLOR[item.category],
        )}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <SymbolIcon symbol={item.symbol} category={item.category} />
            <div>
              <div className="text-white font-bold text-sm leading-tight">{item.label}</div>
              <div className="text-white/40 text-xs font-mono" dir="ltr">
                {item.symbol}
              </div>
            </div>
          </div>
          {hasChange && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                isUp ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300',
              )}
            >
              {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {fmtPercent(Math.abs(item.change24h!))}
            </div>
          )}
        </div>

        {item.priceToman !== null && (
          <div className="mb-2">
            <div className="text-white text-2xl font-black" dir="ltr">
              {item.priceToman.toLocaleString('fa-IR', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-white/40">تومان</div>
          </div>
        )}

        {item.priceUsd !== null && item.symbol !== 'USD' && (
          <div className="text-xs text-white/40 font-mono" dir="ltr">
            ${item.priceUsd.toLocaleString('en-US', { maximumFractionDigits: 2 })}
          </div>
        )}

        <div className="mt-3 -mx-1" dir="ltr">
          <PriceSparkline symbol={item.symbol} days={30} height={36} width={240} />
        </div>
      </div>
    </motion.div>
  );
}
