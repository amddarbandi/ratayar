'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, CreditCard, FileText, MessageSquare, HardDrive,
  Package, ListChecks, Activity, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fmtCompact } from '@/lib/format';
import { toast } from 'sonner';

interface Overview {
  kpis: {
    users: { total: number; active: number; newThisMonth: number; growthPct: number };
    revenue: { thisMonthToman: number; lastMonthToman: number; growthPct: number };
    subscriptions: { active: number; pendingPayments: number };
    content: { documents: number; storageBytes: number; storageMB: number; obligations: number; families: number };
    support: { openTickets: number };
  };
  planBreakdown: { planId: string; code: string; name: string; count: number }[];
  recentAudit: any[];
}

export default function AdminHome() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .overview()
      .then((res) => setData(res.data))
      .catch(() => toast.error('خطا در بارگذاری آمار'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!data) return null;

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          داشبورد مدیریت
        </h1>
        <p className="text-white/50 text-sm">
          نمای کلی پلتفرم — همه چیز در یک نگاه
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        <KPI
          label="کاربران"
          value={k.users.total.toLocaleString('fa-IR')}
          sub={`${k.users.active.toLocaleString('fa-IR')} فعال`}
          icon={Users}
          color="from-purple-500 to-fuchsia-500"
          href="/admin/users"
          trend={k.users.growthPct}
          trendLabel={`+${k.users.newThisMonth} این ماه`}
          delay={0}
        />
        <KPI
          label="درآمد این ماه"
          value={fmtCompact(k.revenue.thisMonthToman)}
          sub={`ماه قبل: ${fmtCompact(k.revenue.lastMonthToman)}`}
          icon={TrendingUp}
          color="from-emerald-500 to-teal-500"
          href="/admin/revenue"
          trend={k.revenue.growthPct}
          delay={0.04}
        />
        <KPI
          label="اشتراک‌های فعال"
          value={k.subscriptions.active.toLocaleString('fa-IR')}
          sub={`${k.subscriptions.pendingPayments} پرداخت معلق`}
          icon={CreditCard}
          color="from-amber-500 to-orange-500"
          href="/admin/payments"
          highlight={k.subscriptions.pendingPayments > 0}
          delay={0.08}
        />
        <KPI
          label="تیکت‌های باز"
          value={k.support.openTickets.toLocaleString('fa-IR')}
          sub="در انتظار پاسخ"
          icon={MessageSquare}
          color="from-cyan-500 to-blue-500"
          href="/admin/tickets"
          highlight={k.support.openTickets > 0}
          delay={0.12}
        />
        <KPI
          label="اسناد"
          value={k.content.documents.toLocaleString('fa-IR')}
          sub={`${k.content.storageMB} MB مصرف`}
          icon={FileText}
          color="from-sky-500 to-indigo-500"
          href="/admin/documents"
          delay={0.16}
        />
        <KPI
          label="تعهدات"
          value={k.content.obligations.toLocaleString('fa-IR')}
          sub="تعهدات ثبت‌شده"
          icon={ListChecks}
          color="from-rose-500 to-pink-500"
          href="/admin/obligations"
          delay={0.2}
        />
        <KPI
          label="خانواده‌ها"
          value={k.content.families.toLocaleString('fa-IR')}
          sub="خانواده‌های فعال"
          icon={Users}
          color="from-violet-500 to-purple-500"
          href="/admin/families"
          delay={0.24}
        />
        <KPI
          label="فضای کل"
          value={
            k.content.storageMB >= 1024
              ? `${(k.content.storageMB / 1024).toFixed(2)} GB`
              : `${k.content.storageMB} MB`
          }
          sub="مصرف کل پلتفرم"
          icon={HardDrive}
          color="from-amber-500 to-yellow-500"
          href="/admin/health"
          delay={0.28}
        />
      </div>

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-white">توزیع پلن‌ها</h2>
          </div>
          {data.planBreakdown.length === 0 ? (
            <div className="text-white/40 text-sm">اطلاعاتی موجود نیست.</div>
          ) : (
            <div className="space-y-3">
              {data.planBreakdown.map((p) => {
                const total = data.planBreakdown.reduce(
                  (s, x) => s + x.count,
                  0,
                );
                const pct = total ? Math.round((p.count / total) * 100) : 0;
                return (
                  <div key={p.planId}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-white/80">{p.name}</span>
                      <span className="text-white/60">
                        {p.count.toLocaleString('fa-IR')} ({pct}%)
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

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-white">آخرین اقدامات</h2>
            </div>
            <Link
              href="/admin/audit-log"
              className="text-xs text-white/50 hover:text-white"
            >
              مشاهده همه →
            </Link>
          </div>
          {data.recentAudit.length === 0 ? (
            <div className="text-white/40 text-sm">
              هنوز اقدام ادمینی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-2">
              {data.recentAudit.slice(0, 8).map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-cyan-400/60 flex-shrink-0" />
                    <span className="text-white/80 font-mono text-xs truncate">
                      {a.action}
                    </span>
                  </div>
                  <span className="text-white/40 text-xs flex-shrink-0 mr-2">
                    {new Date(a.createdAt).toLocaleString('fa-IR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


function KPI({
  label,
  value,
  sub,
  icon: Icon,
  color,
  href,
  trend,
  trendLabel,
  highlight,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: any;
  color: string;
  href?: string;
  trend?: number;
  trendLabel?: string;
  highlight?: boolean;
  delay?: number;
}) {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-4 transition-all h-full',
        highlight
          ? 'border-red-500/40 bg-red-500/5'
          : 'border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] hover:border-white/20',
      )}
    >
      <div
        className={cn(
          'absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br',
          color,
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div
            className={cn(
              'w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center',
              color,
            )}
          >
            <Icon className="w-4 h-4 text-white" />
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs',
                trend >= 0 ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {trend >= 0 ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="text-white/50 text-xs mb-1">{label}</div>
        <div className="text-white text-xl md:text-2xl font-black mb-1">
          {value}
        </div>
        {(sub || trendLabel) && (
          <div className="text-white/40 text-[11px] md:text-xs">
            {sub || trendLabel}
          </div>
        )}
      </div>
    </motion.div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}
