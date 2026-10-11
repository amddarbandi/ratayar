'use client';

import { useMemo, useState } from 'react';
import { Percent, ArrowLeft, Tag, Calculator, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Mode = 'of' | 'change' | 'discount' | 'tip' | 'reverse';

const MODES = [
  { key: 'of', label: 'X درصد از Y', icon: Percent },
  { key: 'change', label: 'درصد تغییر', icon: TrendingUp },
  { key: 'discount', label: 'تخفیف', icon: Tag },
  { key: 'tip', label: 'انعام', icon: Calculator },
  { key: 'reverse', label: 'عدد اصلی قبل از تخفیف', icon: ArrowLeft },
] as const;

export function PercentCalc() {
  const [mode, setMode] = useState<Mode>('of');

  // input values — kept per-mode via one object
  const [a, setA] = useState('10');   // percent or value
  const [b, setB] = useState('200');  // base

  const fa = (n: number) =>
    isFinite(n)
      ? n.toLocaleString('fa-IR', { maximumFractionDigits: 4 })
      : '—';

  const result = useMemo(() => {
    const x = parseFloat(a) || 0;
    const y = parseFloat(b) || 0;
    switch (mode) {
      case 'of':
        return { label: `${fa(x)}٪ از ${fa(y)}`, value: (x * y) / 100 };
      case 'change':
        return {
          label: `تغییر از ${fa(y)} به ${fa(x)}`,
          value: y === 0 ? NaN : ((x - y) / y) * 100,
          suffix: '٪',
        };
      case 'discount':
        return {
          label: `${fa(x)}٪ تخفیف روی ${fa(y)}`,
          value: y - (x * y) / 100,
          extra: `صرفه‌جویی: ${fa((x * y) / 100)}`,
        };
      case 'tip':
        return {
          label: `${fa(x)}٪ انعام روی ${fa(y)}`,
          value: y + (x * y) / 100,
          extra: `انعام: ${fa((x * y) / 100)}`,
        };
      case 'reverse':
        return {
          label: `قیمت اصلی قبل از ${fa(x)}٪ تخفیف`,
          value: x === 100 ? NaN : (y * 100) / (100 - x),
        };
      default:
        return { label: '', value: 0 };
    }
  }, [mode, a, b]);

  return (
    <div className="space-y-6">
      {/* Mode picker */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key as Mode)}
            className={cn(
              'min-h-[52px] rounded-2xl border px-3 flex items-center gap-2 text-xs font-medium transition-all',
              mode === m.key
                ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
            )}
          >
            <m.icon className="w-4 h-4" />
            <span className="text-right">{m.label}</span>
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <label className="text-xs text-white/60">
              {mode === 'change'
                ? 'مقدار جدید'
                : mode === 'reverse'
                  ? 'درصد تخفیف'
                  : 'درصد'}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={a}
              onChange={(e) => setA(e.target.value)}
              dir="ltr"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-2xl font-bold focus:outline-none focus:border-cyan-500/50"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-3">
            <label className="text-xs text-white/60">
              {mode === 'change' ? 'مقدار قبلی' : 'مقدار پایه'}
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={b}
              onChange={(e) => setB(e.target.value)}
              dir="ltr"
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-2xl font-bold focus:outline-none focus:border-cyan-500/50"
            />
          </CardContent>
        </Card>
      </div>

      {/* Result */}
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="text-xs text-white/50 mb-2">{result.label}</div>
          <div className="text-3xl md:text-5xl font-black text-white" dir="ltr">
            {fa(result.value)}
            {'suffix' in result && result.suffix ? result.suffix : ''}
          </div>
          {'extra' in result && result.extra && (
            <div className="text-white/60 text-sm mt-3">{result.extra}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
