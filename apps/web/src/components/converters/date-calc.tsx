'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Plus, Minus, ChevronLeft, ArrowRight, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { JalaliDatePicker } from '@/components/common/jalali-date-picker';
import { toJalali, toJalaliLong, daysUntil } from '@/lib/jalali';

type Mode = 'diff' | 'add' | 'subtract' | 'age';

const MODES = [
  { key: 'diff', label: 'تفاضل دو تاریخ', icon: ArrowRight },
  { key: 'add', label: 'افزودن روز', icon: Plus },
  { key: 'subtract', label: 'کاهش روز', icon: Minus },
  { key: 'age', label: 'محاسبه سن', icon: Sparkles },
] as const;

export function DateCalc() {
  const [mode, setMode] = useState<Mode>('diff');
  const [d1, setD1] = useState<string>('');
  const [d2, setD2] = useState<string>('');
  const [days, setDays] = useState('30');

  const fa = (n: number) =>
    isFinite(n) ? n.toLocaleString('fa-IR') : '—';

  const result = useMemo(() => {
    const nDays = parseInt(days, 10) || 0;
    switch (mode) {
      case 'diff': {
        if (!d1 || !d2) return { label: '', value: '', sub: '' };
        const a = new Date(d1);
        const b = new Date(d2);
        const diffMs = Math.abs(b.getTime() - a.getTime());
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        const weeks = Math.floor(diffDays / 7);
        const months = Math.floor(diffDays / 30.44);
        const years = (diffDays / 365.25).toFixed(2);
        return {
          label: 'تفاضل',
          value: `${fa(diffDays)} روز`,
          sub: `${fa(weeks)} هفته — ${fa(months)} ماه — ${years} سال`,
        };
      }
      case 'add':
      case 'subtract': {
        if (!d1) return { label: '', value: '', sub: '' };
        const base = new Date(d1);
        const delta = (mode === 'add' ? 1 : -1) * nDays * 86400000;
        const target = new Date(base.getTime() + delta);
        return {
          label:
            mode === 'add'
              ? `${fa(nDays)} روز بعد`
              : `${fa(nDays)} روز قبل`,
          value: toJalaliLong(target),
          sub: toJalali(target).jy
            ? `${toJalali(target).jy}/${String(toJalali(target).jm).padStart(2, '0')}/${String(toJalali(target).jd).padStart(2, '0')}`
            : '',
        };
      }
      case 'age': {
        if (!d1) return { label: '', value: '', sub: '' };
        const now = new Date();
        const birth = new Date(d1);
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let d = now.getDate() - birth.getDate();
        if (d < 0) {
          months--;
          const prev = new Date(now.getFullYear(), now.getMonth(), 0);
          d += prev.getDate();
        }
        if (months < 0) {
          years--;
          months += 12;
        }
        const totalDays = Math.round(
          (now.getTime() - birth.getTime()) / 86400000,
        );
        return {
          label: 'سن',
          value: `${fa(years)} سال و ${fa(months)} ماه و ${fa(d)} روز`,
          sub: `مجموعاً ${fa(totalDays)} روز`,
        };
      }
      default:
        return { label: '', value: '', sub: '' };
    }
  }, [mode, d1, d2, days]);

  return (
    <div className="space-y-6">
      {/* Mode picker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key as Mode)}
            className={cn(
              'min-h-[52px] rounded-2xl border px-3 flex items-center gap-2 text-xs font-medium transition-all',
              mode === m.key
                ? 'bg-purple-500/20 border-purple-500/50 text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
            )}
          >
            <m.icon className="w-4 h-4" />
            {m.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 space-y-3">
            <JalaliDatePicker
              label={
                mode === 'age'
                  ? 'تاریخ تولد'
                  : mode === 'diff'
                    ? 'تاریخ اول'
                    : 'تاریخ پایه'
              }
              required
              value={d1 || null}
              onChange={setD1}
            />
          </CardContent>
        </Card>

        {mode === 'diff' && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <JalaliDatePicker
                label="تاریخ دوم"
                required
                value={d2 || null}
                onChange={setD2}
              />
            </CardContent>
          </Card>
        )}

        {(mode === 'add' || mode === 'subtract') && (
          <Card>
            <CardContent className="p-5 space-y-3">
              <label className="block text-xs text-white/60">
                تعداد روز
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                dir="ltr"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-2xl font-bold focus:outline-none focus:border-purple-500/50"
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Result */}
      {result.value && (
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="text-xs text-white/50 mb-2">{result.label}</div>
            <div className="text-2xl md:text-3xl font-black text-white">
              {result.value}
            </div>
            {result.sub && (
              <div className="text-white/60 text-sm mt-3">{result.sub}</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
