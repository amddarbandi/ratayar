'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowLeftRight, Copy, Check } from 'lucide-react';
import { CATEGORIES, convert, type Category, type Unit } from '@/lib/unit-conversions';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ConvertersPage() {
  const [activeCat, setActiveCat] = useState<Category | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl">
            🔄
          </div>
          <h1 className="text-3xl font-bold text-white">
            {activeCat ? activeCat.label : 'کانورت‌ها'}
          </h1>
        </div>
        <p className="text-white/50">
          {activeCat
            ? 'مقدار را وارد کن — بلافاصله تبدیل می‌شود'
            : 'هر چیزی به هر چیزی — سریع، دقیق و رنگی'}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!activeCat ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
          >
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveCat(cat)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-6 text-right transition-all hover:border-white/30 hover:scale-[1.03]"
              >
                <div
                  className={cn(
                    'absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl opacity-30 group-hover:opacity-60 transition-opacity bg-gradient-to-br',
                    cat.color,
                  )}
                />
                <div className="relative">
                  <div className="text-5xl mb-4">{cat.emoji}</div>
                  <div className="font-bold text-white text-lg mb-1">
                    {cat.label}
                  </div>
                  <div className="text-xs text-white/40">
                    {cat.units.length} واحد
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="converter"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <button
              onClick={() => setActiveCat(null)}
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              بازگشت به همه دسته‌ها
            </button>

            <ConverterPanel category={activeCat} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ConverterPanel({ category }: { category: Category }) {
  const [fromUnit, setFromUnit] = useState<Unit>(category.units[0]);
  const [toUnit, setToUnit] = useState<Unit>(category.units[1] || category.units[0]);
  const [inputValue, setInputValue] = useState('1');
  const [copied, setCopied] = useState(false);

  const numValue = parseFloat(inputValue) || 0;
  const result = convert(numValue, fromUnit, toUnit);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(result));
      setCopied(true);
      toast.success('نتیجه کپی شد');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('کپی نشد');
    }
  };

  const fmt = (n: number) => {
    if (!isFinite(n)) return '—';
    if (Math.abs(n) >= 1e9 || (Math.abs(n) < 1e-4 && n !== 0)) {
      return n.toExponential(4);
    }
    return n.toLocaleString('fa-IR', { maximumFractionDigits: 6 });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
        {/* FROM */}
        <Card className="md:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div className="text-xs text-white/50 font-medium">
              از واحد
            </div>
            <UnitSelector
              units={category.units}
              value={fromUnit}
              onChange={setFromUnit}
            />
            <input
              type="text"
              inputMode="decimal"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-2xl font-bold focus:outline-none focus:border-purple-500/50 transition-colors"
              dir="ltr"
              autoFocus
            />
            <div className="text-xs text-white/40">
              {fromUnit.symbol}
            </div>
          </CardContent>
        </Card>

        {/* SWAP */}
        <div className="flex items-center justify-center">
          <button
            onClick={swap}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform"
            title="جابجایی"
          >
            <ArrowLeftRight className="w-6 h-6" />
          </button>
        </div>

        {/* TO */}
        <Card className="md:col-span-2">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-xs text-white/50 font-medium">
                به واحد
              </div>
              <button
                onClick={copy}
                className="text-white/40 hover:text-white transition-colors"
                title="کپی نتیجه"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <UnitSelector
              units={category.units}
              value={toUnit}
              onChange={setToUnit}
            />
            <div
              className="w-full bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 rounded-2xl p-4 text-white text-2xl font-bold min-h-[68px] flex items-center"
              dir="ltr"
            >
              {fmt(result)}
            </div>
            <div className="text-xs text-white/40">{toUnit.symbol}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick reference table */}
      <Card>
        <CardContent className="p-6">
          <div className="text-sm font-bold text-white mb-4">
            تبدیل سریع — یک {fromUnit.label}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {category.units
              .filter((u) => u.key !== fromUnit.key)
              .map((u) => (
                <div
                  key={u.key}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="text-xs text-white/50 mb-1">{u.label}</div>
                  <div className="text-white font-bold text-sm" dir="ltr">
                    {fmt(convert(1, fromUnit, u))}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function UnitSelector({
  units,
  value,
  onChange,
}: {
  units: Unit[];
  value: Unit;
  onChange: (u: Unit) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {units.map((u) => (
        <button
          key={u.key}
          onClick={() => onChange(u)}
          className={cn(
            'px-3 py-1.5 rounded-xl text-xs font-medium transition-all border',
            value.key === u.key
              ? 'bg-purple-500/20 border-purple-500/50 text-white'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white',
          )}
        >
          {u.symbol}
        </button>
      ))}
    </div>
  );
}
