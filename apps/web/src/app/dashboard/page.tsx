'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar, Package, Wallet, TrendingUp, Bell, ArrowLeft,
  Clock, CheckCircle2, AlertCircle, Plus, Loader2, Award,
  Users, ArrowUpRight, ArrowDownRight, Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { dashboardApi, reportsApi } from '@/lib/api';
import { cn } from '@/lib/utils';

const priorityConfig: any = {
  critical: { badge: 'bg-red-500/20 text-red-300 border-red-500/30', icon: AlertCircle, iconColor: 'text-red-400', iconBg: 'bg-red-500/10' },
  important: { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Clock, iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
  normal: { badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: CheckCircle2, iconColor: 'text-cyan-400', iconBg: 'bg-cyan-500/10' },
};

const formatPrice = (price: number) => {
  if (!price) return '۰';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} میلیارد`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)} میلیون`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)} هزار`;
  return `${price}`;
};

const formatDate = (date: string) => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} روز گذشته`;
  if (diff === 0) return 'امروز';
  if (diff === 1) return 'فردا';
  if (diff < 30) return `${diff} روز دیگر`;
  return d.toLocaleDateString('fa-IR');
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => dashboardApi.summary(),
    refetchInterval: 60000,
  });

  const { data: disciplineData } = useQuery({
    queryKey: ['dashboard-discipline'],
    queryFn: () => reportsApi.disciplineHistory(6),
  });

  const summary = summaryData?.data;
  const stats = summary?.stats || {};
  const todayObligations = summary?.todayObligations || [];
  const upcoming = summary?.upcomingObligations || [];
  const discipline = disciplineData?.data || [];
  const family = summary?.family;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    );
  }

  const score = stats.disciplineScore || 85;
  const scoreColor = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-6">
      {/* ============================================ */}
      {/* Welcome Header */}
      {/* ============================================ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
            سلام، <span className="gradient-text">{user?.fullName}</span> 👋
          </h1>
          <p className="text-white/50">
            {todayObligations.length > 0
              ? `امروز ${todayObligations.length} تعهد داری`
              : 'امروز تعهدی نداری، روز خوبی داشته باشی!'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/obligations/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-500/30 hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            تعهد جدید
          </Link>
        </div>
      </motion.div>

      {/* ============================================ */}
      {/* Stats Grid */}
      {/* ============================================ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Discipline Score */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card className="p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/50">امتیاز نظم</span>
            </div>
            <div className="text-3xl font-black mb-1" style={{ color: scoreColor }}>
              {score}
            </div>
            <div className="text-white/40 text-xs">
              {score >= 80 ? '🏆 عالی' : score >= 60 ? '👍 خوب' : '📈 قابل بهبود'}
            </div>
          </Card>
        </motion.div>

        {/* Active Obligations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/50">تعهدات فعال</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {stats.activeObligations || 0}
            </div>
            <div className="text-white/40 text-xs">
              {stats.completedObligations || 0} انجام‌شده
            </div>
          </Card>
        </motion.div>

        {/* Assets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/50">دارایی‌ها</span>
            </div>
            <div className="text-3xl font-black text-white mb-1">
              {stats.totalAssets || 0}
            </div>
            <div className="text-white/40 text-xs">
              {formatPrice(stats.totalAssetsValue || 0)} ارزش
            </div>
          </Card>
        </motion.div>

        {/* Balance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-5 h-full">
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br',
                (stats.monthBalance || 0) >= 0
                  ? 'from-orange-500 to-red-500'
                  : 'from-red-500 to-rose-500',
              )}>
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-white/50">مانده ماه</span>
            </div>
            <div className={cn(
              'text-2xl font-black mb-1',
              (stats.monthBalance || 0) >= 0 ? 'text-emerald-400' : 'text-red-400',
            )}>
              {formatPrice(Math.abs(stats.monthBalance || 0))}
            </div>
            <div className="text-white/40 text-xs">
              درآمد: {formatPrice(stats.monthIncome || 0)}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ============================================ */}
      {/* Two Column Layout */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Today + Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    <h2 className="text-lg font-bold text-white">تعهدات امروز</h2>
                  </div>
                  <Link
                    href="/dashboard/obligations"
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    مشاهده همه
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>

                {todayObligations.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <p className="text-white/60 text-sm">امروز تعهدی نداری 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {todayObligations.map((item: any) => {
                      const config = priorityConfig[item.priority] || priorityConfig.normal;
                      const Icon = config.icon;
                      return (
                        <Link
                          key={item.id}
                          href="/dashboard/obligations"
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-2xl border hover:scale-[1.01] transition-transform',
                            config.iconBg,
                            'border-white/5',
                          )}
                        >
                          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', config.iconBg)}>
                            <Icon className={cn('w-4 h-4', config.iconColor)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">
                              {item.title}
                            </div>
                          </div>
                          <div className={cn('px-2.5 py-1 rounded-full text-xs border whitespace-nowrap', config.badge)}>
                            امروز
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-white">تعهدات پیش‌رو</h2>
                  <Link
                    href="/dashboard/obligations"
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    مشاهده همه
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>

                {upcoming.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/40 text-sm">تعهد نزدیکی نداری</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcoming.map((item: any) => {
                      const config = priorityConfig[item.priority] || priorityConfig.normal;
                      const Icon = config.icon;
                      return (
                        <Link
                          key={item.id}
                          href="/dashboard/obligations"
                          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-white/5 transition-colors"
                        >
                          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', config.iconBg)}>
                            <Icon className={cn('w-4 h-4', config.iconColor)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-white text-sm truncate">
                              {item.title}
                            </div>
                            {item.description && (
                              <div className="text-white/40 text-xs truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          <div className={cn('px-2.5 py-1 rounded-full text-xs border whitespace-nowrap', config.badge)}>
                            {formatDate(item.dueDate)}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right: Discipline Chart + Quick Actions + Family */}
        <div className="space-y-6">
          {/* Discipline Chart */}
          {discipline.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-bold text-white mb-4">روند نظم</h2>
                  <div style={{ direction: 'ltr' }}>
                    <ResponsiveContainer width="100%" height={140}>
                      <AreaChart data={discipline}>
                        <defs>
                          <linearGradient id="dashScoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgba(10,10,15,0.95)',
                            border: '1px solid rgba(168,85,247,0.3)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: 12,
                          }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#a855f7" strokeWidth={2} fill="url(#dashScoreGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Family Card */}
          {family && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate">{family.name}</h3>
                      <div className="text-white/50 text-xs">
                        {family.memberCount} از {family.maxMembers} عضو
                      </div>
                    </div>
                  </div>

                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(family.memberCount / family.maxMembers) * 100}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    />
                  </div>

                  <Link
                    href="/dashboard/family-tree"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm"
                  >
                    <span className="text-white/70">مشاهده شجره‌نامه</span>
                    <ArrowLeft className="w-4 h-4 text-white/40" />
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <Card>
              <CardContent className="p-5">
                <h2 className="text-lg font-bold text-white mb-4">دسترسی سریع</h2>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { href: '/dashboard/obligations/new', label: 'تعهد جدید', icon: Calendar, gradient: 'from-purple-500 to-pink-500' },
                    { href: '/dashboard/assets/new', label: 'دارایی جدید', icon: Package, gradient: 'from-cyan-500 to-blue-500' },
                    { href: '/dashboard/finance', label: 'مالی', icon: Wallet, gradient: 'from-emerald-500 to-teal-500' },
                    { href: '/dashboard/reports', label: 'گزارش‌ها', icon: TrendingUp, gradient: 'from-orange-500 to-red-500' },
                  ].map((action, i) => (
                    <Link
                      key={i}
                      href={action.href}
                      className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all group"
                    >
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-gradient-to-br', action.gradient)}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white text-xs font-medium text-center">
                        {action.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          {stats.unreadNotifications > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Link href="/dashboard/notifications">
                <Card className="p-5 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 hover:border-purple-500/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center relative">
                      <Bell className="w-5 h-5 text-purple-400" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                        {stats.unreadNotifications > 9 ? '9+' : stats.unreadNotifications}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">
                        {stats.unreadNotifications} اعلان جدید
                      </div>
                      <div className="text-white/50 text-xs">مشاهده کن</div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-white/40" />
                  </div>
                </Card>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
