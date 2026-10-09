'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { marketApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { PriceSparkline } from '@/components/market/price-sparkline';
import { cn } from '@/lib/utils';
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

const SYMBOL_BG: Record<string, string> = {
  USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', AED: '🇦🇪', TRY: '🇹🇷',
  BTC: '₿', ETH: 'Ξ', USDT: '₮', BNB: 'B', SOL: 'S',
  XRP: 'X', TRX: 'T', DOGE: 'Ð', ADA: 'A', XAUT: 'Au',
  GOLD18: 'Au', GOLD24: 'Au', MESGHAL: 'M', XAU: 'Au',
  SEKKE_EMAMI: '🪙', SEKKE_BAHAR: '🪙', NIM: '🪙', ROB: '🪙',
};

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
    <div className="space-y-6">
      {/* Header */}
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
          <RefreshCw
            className={cn('w-4 h-4', refreshing && 'animate-spin')}
          />
          به‌روزرسانی
        </button>
      </div>

      {/* USD hero */}
      {data && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-xs text-white/50 mb-1">
                  دلار آمریکا (میانگین TGJU + والتکس)
                </div>
                <div className="text-4xl font-black text-white" dir="ltr">
                  {data.usdToman.toLocaleString('fa-IR')}
                  <span className="text-lg text-white/50 mr-2">تومان</span>
                </div>
              </div>
              <div className="text-xs text-white/40">
                آخرین به‌روزرسانی:{' '}
                {new Date(data.fetchedAt).toLocaleTimeString('fa-IR')}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter tabs */}
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

      {/* Cards grid */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-40 rounded-3xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {!loading && (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {items.map((it, i) => (
              <PriceCard key={it.key} item={it} delay={i * 0.03} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
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
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg',
                CAT_COLOR[item.category],
              )}
            >
              {SYMBOL_BG[item.symbol] || item.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">
                {item.label}
              </div>
              <div className="text-white/40 text-xs font-mono" dir="ltr">
                {item.symbol}
              </div>
            </div>
          </div>
          {hasChange && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs px-2 py-1 rounded-full',
                isUp
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'bg-red-500/15 text-red-300',
              )}
            >
              {isUp ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(item.change24h!).toFixed(2)}%
            </div>
          )}
        </div>

        {/* Price Toman */}
        {item.priceToman !== null && (
          <div className="mb-2">
            <div className="text-white text-2xl font-black" dir="ltr">
              {item.priceToman.toLocaleString('fa-IR', {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-xs text-white/40">تومان</div>
          </div>
        )}

        {/* USD ref */}
        {item.priceUsd !== null && item.symbol !== 'USD' && (
          <div className="text-xs text-white/40 font-mono" dir="ltr">
            ${item.priceUsd.toLocaleString('en-US', {
              maximumFractionDigits: 2,
            })}
          </div>
        )}

        {/* Sparkline */}
        <div className="mt-3 -mx-1" dir="ltr">
          <PriceSparkline symbol={item.symbol} days={30} height={36} width={240} />
        </div>
      </div>
    </motion.div>
  );
}
