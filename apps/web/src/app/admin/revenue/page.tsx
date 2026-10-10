'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, Package } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fmtCompact } from '@/lib/format';
import { toast } from 'sonner';

interface Revenue {
  mrr: number;
  arr: number;
  thisMonthTotal: number;
  lastMonthTotal: number;
  growthPct: number;
  monthSeries: { month: string; total: number }[];
  byPlan: { code: string; name: string; total: number; count: number }[];
}

const JG_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

export default function AdminRevenuePage() {
  const [data, setData] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .revenue()
      .then((res) => setData(res.data))
      .catch(() => toast.error('خطا در بارگذاری درآمد'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const maxMonth = Math.max(...data.monthSeries.map((m) => m.total), 1);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          درآمد
        </h1>
        <p className="text-white/50 text-sm">
          MRR، ARR، درآمد ماهانه و تفکیک بر اساس پلن
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Big label="MRR" value={fmtCompact(data.mrr)} icon={DollarSign} color="from-emerald-500 to-teal-500" sub="درآمد ماهانه تکرارشده" />
        <Big label="ARR" value={fmtCompact(data.arr)} icon={TrendingUp} color="from-cyan-500 to-blue-500" sub="درآمد سالانه" />
        <Big
          label="این ماه"
          value={fmtCompact(data.thisMonthTotal)}
          icon={DollarSign}
          color="from-purple-500 to-fuchsia-500"
          sub={`ماه قبل: ${fmtCompact(data.lastMonthTotal)}`}
          trend={data.growthPct}
        />
        <Big
          label="تعداد پلن‌های فعال"
          value={data.byPlan.reduce((s, p) => s + p.count, 0).toLocaleString('fa-IR')}
          icon={Package}
          color="from-amber-500 to-orange-500"
          sub="در آخرین ۱۲ ماه"
        />
      </div>

      {/* Monthly bar chart */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <h2 className="font-bold text-white mb-5">روند ۱۲ ماه اخیر</h2>
          {data.monthSeries.length === 0 ? (
            <div className="text-white/40 text-sm">داده‌ای موجود نیست.</div>
          ) : (
            <div className="flex items-end gap-2 h-56">
              {data.monthSeries.map((m, i) => {
                const pct = (m.total / maxMonth) * 100;
                const [y, mo] = m.month.split('-');
                const label = `${JG_MONTHS[parseInt(mo, 10) - 1]}`;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex-1 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct, m.total > 0 ? 4 : 1)}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className={cn(
                          'w-full rounded-t-lg bg-gradient-to-t',
                          m.total > 0
                            ? 'from-emerald-500/30 to-emerald-400/80'
                            : 'from-white/5 to-white/10',
                        )}
                      />
                    </div>
                    <div className="text-[10px] text-white/40 whitespace-nowrap">
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* By plan */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <h2 className="font-bold text-white mb-4">تفکیک بر اساس پلن</h2>
          {data.byPlan.length === 0 ? (
            <div className="text-white/40 text-sm">پرداختی ثبت نشده.</div>
          ) : (
            <div className="space-y-3">
              {data.byPlan.map((p) => {
                const total = data.byPlan.reduce((s, x) => s + x.total, 0);
                const pct = total ? Math.round((p.total / total) * 100) : 0;
                return (
                  <div key={p.code}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/80">{p.name}</span>
                      <span className="text-white/60">
                        {fmtCompact(p.total)} ({p.count.toLocaleString('fa-IR')} تراکنش)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function Big({
  label, value, icon: Icon, color, sub, trend,
}: { label: string; value: string; icon: any; color: string; sub?: string; trend?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4"
    >
      <div className={cn('absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-20 bg-gradient-to-br', color)} />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center', color)}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          {trend !== undefined && (
            <div className={cn('flex items-center gap-0.5 text-xs', trend >= 0 ? 'text-emerald-400' : 'text-red-400')}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-white/50 text-xs mb-1">{label}</div>
        <div className="text-white text-xl md:text-2xl font-black mb-1">{value}</div>
        {sub && <div className="text-white/40 text-[11px] md:text-xs">{sub}</div>}
      </div>
    </motion.div>
  );
}
