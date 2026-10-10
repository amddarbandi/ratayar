'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Activity, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliShort } from '@/lib/jalali';

interface Analytics {
  rangeDays: number;
  dau: { day: string; activeUsers: number }[];
  signups: { day: string; count: number }[];
  revenue: { day: string; total: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    setLoading(true);
    adminApi
      .analytics(range)
      .then((res) => setData(res.data))
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading && !data) {
    return (
      <div className="text-white/40 text-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        در حال بارگذاری...
      </div>
    );
  }
  if (!data) return null;

  const totalSignups = data.signups.reduce((s, x) => s + x.count, 0);
  const totalRevenue = data.revenue.reduce((s, x) => s + x.total, 0);
  const avgDAU = data.dau.length
    ? Math.round(
        data.dau.reduce((s, x) => s + x.activeUsers, 0) / data.dau.length,
      )
    : 0;
  const peakDAU = data.dau.reduce(
    (m, x) => Math.max(m, x.activeUsers),
    0,
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              آنالیتیکس
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            آمار رشد، فعالیت کاربران و درآمد
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              className={cn(
                'min-h-[40px] px-3 rounded-xl text-xs font-medium border',
                range === d
                  ? 'bg-purple-500/20 border-purple-500/50 text-white'
                  : 'bg-white/5 border-white/10 text-white/60',
              )}
            >
              {d} روز
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <SmallKPI
          label="میانگین کاربر فعال روزانه"
          value={avgDAU.toLocaleString('fa-IR')}
          icon={Users}
          color="from-cyan-500 to-blue-500"
        />
        <SmallKPI
          label="اوج کاربران فعال"
          value={peakDAU.toLocaleString('fa-IR')}
          icon={Activity}
          color="from-purple-500 to-fuchsia-500"
        />
        <SmallKPI
          label="ثبت‌نام در بازه"
          value={totalSignups.toLocaleString('fa-IR')}
          icon={Users}
          color="from-emerald-500 to-teal-500"
        />
        <SmallKPI
          label="درآمد بازه"
          value={fmtToman(totalRevenue)}
          icon={TrendingUp}
          color="from-amber-500 to-orange-500"
        />
      </div>

      <ChartCard
        title="کاربران فعال روزانه (DAU)"
        data={data.dau.map((d) => ({
          day: d.day,
          value: d.activeUsers,
        }))}
        color="from-cyan-500/30 to-cyan-400/80"
      />

      <ChartCard
        title="ثبت‌نام روزانه"
        data={data.signups.map((s) => ({ day: s.day, value: s.count }))}
        color="from-emerald-500/30 to-emerald-400/80"
      />

      <ChartCard
        title="درآمد روزانه"
        data={data.revenue.map((r) => ({ day: r.day, value: r.total }))}
        color="from-amber-500/30 to-amber-400/80"
        formatY={fmtToman}
      />
    </div>
  );
}

function fmtToman(n: number) {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toLocaleString('fa-IR');
}

function SmallKPI({
  label, value, icon: Icon, color,
}: { label: string; value: string; icon: any; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4"
    >
      <div className={cn('absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-20 bg-gradient-to-br', color)} />
      <div className="relative">
        <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3', color)}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="text-white/50 text-xs mb-1">{label}</div>
        <div className="text-white text-xl md:text-2xl font-black">{value}</div>
      </div>
    </motion.div>
  );
}

function ChartCard({
  title, data, color, formatY,
}: {
  title: string;
  data: { day: string; value: number }[];
  color: string;
  formatY?: (n: number) => string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const fmt = formatY || ((n: number) => n.toLocaleString('fa-IR'));

  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <h2 className="font-bold text-white mb-4">{title}</h2>
        {data.length === 0 ? (
          <div className="text-white/40 text-sm">داده‌ای در این بازه نیست.</div>
        ) : (
          <>
            <div className="flex items-end gap-1 h-48">
              {data.map((d, i) => {
                const pct = (d.value / max) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-6 hidden group-hover:block bg-black/90 border border-white/10 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap">
                      {fmt(d.value)}
                    </div>
                    <div className="w-full flex-1 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct, d.value > 0 ? 3 : 1)}%` }}
                        transition={{ delay: i * 0.02, duration: 0.4 }}
                        className={cn('w-full rounded-t bg-gradient-to-t', color)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {data.length > 0 && (
              <div className="flex justify-between text-[10px] text-white/40 mt-2">
                <span>{toJalaliShort(data[0].day)}</span>
                <span>{toJalaliShort(data[data.length - 1].day)}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
