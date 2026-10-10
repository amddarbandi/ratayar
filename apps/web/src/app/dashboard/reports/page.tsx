'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet, Package, Calendar,
  FileText, Bell, Loader2, Download,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, RadialBarChart, RadialBar,
} from 'recharts';
import { reportsApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fmtMoney } from '@/lib/format';

const categoryLabels: any = {
  financial: 'مالی',
  health: 'سلامت',
  life: 'زندگی',
  family: 'خانواده',
  business: 'کسب‌وکار',
};



export default function ReportsPage() {
  const { data: overview, isLoading } = useQuery({
    queryKey: ['reports-overview'],
    queryFn: () => reportsApi.overview(),
  });

  const { data: discipline } = useQuery({
    queryKey: ['reports-discipline'],
    queryFn: () => reportsApi.disciplineHistory(6),
  });

  const { data: byCategory } = useQuery({
    queryKey: ['reports-categories'],
    queryFn: () => reportsApi.obligationsByCategory(),
  });

  const { data: yearly } = useQuery({
    queryKey: ['reports-yearly'],
    queryFn: () => reportsApi.yearlySummary(),
  });

  const ov = overview?.data || {};
  const disc = discipline?.data || [];
  const cats = byCategory?.data || [];
  const yr = yearly?.data || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  const score = ov.disciplineScore || 0;
  const scoreColor =
    score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">گزارش‌ها</h1>
          <p className="text-white/50">نگاه جامع به وضعیت زندگی شما</p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          چاپ / PDF
        </button>
      </div>

      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 h-full">
            <h2 className="text-sm font-medium text-white/60 mb-2">امتیاز نظم</h2>
            <div style={{ direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height={140}>
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={[{ value: score, fill: scoreColor }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    background={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center -mt-24 mb-14">
              <div className="text-3xl font-black" style={{ color: scoreColor }}>
                {score}
              </div>
              <div className="text-white/40 text-xs">از ۱۰۰</div>
            </div>
            <div className="text-center text-xs text-white/50">
              {score >= 80 ? '🏆 عالی' : score >= 60 ? '👍 خوب' : '📈 نیاز به بهبود'}
            </div>
          </Card>
        </motion.div>

        {[
          { label: 'تعهدات فعال', value: ov.obligations?.active || 0, icon: Calendar, gradient: 'from-purple-500 to-pink-500' },
          { label: 'دارایی‌ها', value: ov.assets?.total || 0, icon: Package, gradient: 'from-cyan-500 to-blue-500' },
          { label: 'اسناد', value: ov.documents?.total || 0, icon: FileText, gradient: 'from-emerald-500 to-teal-500' },
          { label: 'اعلان‌های نخوانده', value: ov.notifications?.unread || 0, icon: Bell, gradient: 'from-orange-500 to-red-500' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="p-6 h-full">
              <div className={cn('w-10 h-10 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br', stat.gradient)}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-white/50 text-xs">{stat.label}</div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Finance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">روند نظم ۶ ماه</h2>
            {disc.length > 0 ? (
              <div style={{ direction: 'ltr' }}>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={disc}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(10,10,15,0.95)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        borderRadius: '12px',
                        color: 'white',
                      }}
                    />
                    <Area type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2.5} fill="url(#scoreGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-white/30 text-sm">
                داده‌ای موجود نیست
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">مالی این ماه</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/50">درآمد</div>
                  <div className="text-lg font-bold text-white">
                    {fmtMoney(ov.finance?.month?.income || 0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/50">هزینه</div>
                  <div className="text-lg font-bold text-white">
                    {fmtMoney(ov.finance?.month?.expense || 0)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  (ov.finance?.month?.balance || 0) >= 0 ? 'bg-purple-500/10' : 'bg-orange-500/10',
                )}>
                  <Wallet className={cn(
                    'w-5 h-5',
                    (ov.finance?.month?.balance || 0) >= 0 ? 'text-purple-400' : 'text-orange-400',
                  )} />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-white/50">مانده</div>
                  <div className={cn(
                    'text-lg font-bold',
                    (ov.finance?.month?.balance || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
                  )}>
                    {fmtMoney(Math.abs(ov.finance?.month?.balance || 0))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">تعهدات بر اساس دسته</h2>
            {cats.length > 0 ? (
              <div style={{ direction: 'ltr' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={cats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="category"
                      stroke="rgba(255,255,255,0.3)"
                      fontSize={12}
                      tickFormatter={(v) => categoryLabels[v] || v}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(10,10,15,0.95)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        direction: 'rtl',
                      }}
                    />
                    <Bar dataKey="total" fill="rgba(168,85,247,0.5)" radius={[0, 8, 8, 0]} />
                    <Bar dataKey="completed" fill="#a855f7" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 flex items-center justify-center text-white/30 text-sm">
                تعهدی ثبت نشده
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">
              خلاصه سال {yr.year || new Date().getFullYear()}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                  <div className="text-xs text-emerald-300 mb-1">درآمد</div>
                  <div className="text-lg font-bold text-white">
                    {fmtMoney(yr.income || 0)}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
                  <div className="text-xs text-red-300 mb-1">هزینه</div>
                  <div className="text-lg font-bold text-white">
                    {fmtMoney(yr.expense || 0)}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">نرخ پس‌انداز</div>
                  <div className="text-lg font-black gradient-text">
                    {yr.savingsRate || 0}٪
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, yr.savingsRate || 0)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                <div>
                  <div className="text-xs text-white/50 mb-1">نرخ موفقیت تعهدات</div>
                  <div className="text-xl font-bold text-white">
                    {yr.obligations?.completionRate || 0}٪
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50 mb-1">ارزش دارایی‌ها</div>
                  <div className="text-xl font-bold text-white">
                    {fmtMoney(yr.assets?.totalValue || 0)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
