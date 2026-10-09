'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, RefreshCw, Search, Plus, X, ChevronLeft, Ban } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliString } from '@/lib/jalali';

interface Sub {
  id: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  plan: { code: string; name: string; priceMonthly: string };
  user: { id: string; phone: string; fullName: string | null };
}

const STATUS_MAP: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300',
  expired: 'bg-gray-500/20 text-gray-400',
  cancelled: 'bg-red-500/20 text-red-300',
  pending: 'bg-amber-500/20 text-amber-300',
};

export default function AdminSubscriptionsPage() {
  const [items, setItems] = useState<Sub[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('active');
  const [q, setQ] = useState('');
  const [extending, setExtending] = useState<Sub | null>(null);
  const [months, setMonths] = useState(1);
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listSubscriptions({ status, q, limit: 50 })
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, q]);

  const doExtend = async () => {
    if (!extending) return;
    setActing(true);
    try {
      await adminApi.extendSubscription(extending.id, months);
      toast.success('اشتراک تمدید شد');
      setExtending(null);
      setMonths(1);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا');
    } finally {
      setActing(false);
    }
  };

  const doCancel = async (s: Sub) => {
    if (!confirm(`اشتراک «${s.user.phone}» لغو شود؟`)) return;
    try {
      await adminApi.cancelSubscription(s.id);
      toast.success('اشتراک لغو شد');
      load();
    } catch {
      toast.error('خطا در لغو');
    }
  };

  const tabs = [
    { key: 'active', label: 'فعال' },
    { key: 'expired', label: 'منقضی' },
    { key: 'cancelled', label: 'لغو شده' },
    { key: '', label: 'همه' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          اشتراک‌ها
        </h1>
        <p className="text-white/50 text-sm">
          {total.toLocaleString('fa-IR')} اشتراک
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو با شماره یا نام کاربر..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-base"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap border',
              status === t.key
                ? 'bg-purple-500/20 border-purple-500/40 text-white'
                : 'bg-white/5 border-white/10 text-white/60',
            )}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {loading && items.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
          اشتراکی یافت نشد.
        </div>
      )}

      <div className="space-y-2">
        {items.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {s.plan.name}
                      </span>
                      <span className={cn('text-[11px] px-2 py-0.5 rounded-full', STATUS_MAP[s.status] || 'bg-white/10')}>
                        {s.status}
                      </span>
                    </div>
                    <Link
                      href={`/admin/users/${s.user.id}`}
                      className="text-white/60 text-xs hover:text-white flex items-center gap-1"
                    >
                      {s.user.fullName || '—'} • <span dir="ltr" className="font-mono">{s.user.phone}</span>
                      <ChevronLeft className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">
                      {Number(s.plan.priceMonthly).toLocaleString('fa-IR')}
                    </div>
                    <div className="text-white/40 text-[11px]">تومان / ماه</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <div className="rounded-xl bg-white/[0.03] p-2">
                    <div className="text-white/40 mb-0.5">شروع</div>
                    <div className="text-white">{toJalaliString(s.startedAt)}</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] p-2">
                    <div className="text-white/40 mb-0.5">انقضا</div>
                    <div className="text-white">
                      {s.expiresAt ? toJalaliString(s.expiresAt) : 'بدون انقضا'}
                    </div>
                  </div>
                </div>

                {s.status === 'active' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setExtending(s)}
                      className="flex-1 min-h-[44px] flex items-center justify-center gap-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      تمدید
                    </button>
                    <button
                      onClick={() => doCancel(s)}
                      className="min-h-[44px] px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"
                      aria-label="لغو"
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Extend modal */}
      {extending && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setExtending(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50 rounded-3xl border border-white/10 bg-[#0f0f16] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">تمدید اشتراک</h3>
              <button onClick={() => setExtending(null)} className="text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-white/60 text-sm mb-4">
              کاربر: {extending.user.fullName || '—'} ({extending.user.phone})
            </div>
            <div className="mb-5">
              <label className="block text-xs text-white/60 mb-2">تعداد ماه</label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={cn(
                      'min-h-[44px] rounded-xl text-sm font-medium border',
                      months === m
                        ? 'bg-purple-500/20 border-purple-500/50 text-white'
                        : 'bg-white/5 border-white/10 text-white/60',
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={doExtend}
              disabled={acting}
              className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium disabled:opacity-50"
            >
              {acting ? 'در حال اعمال...' : `تمدید ${months} ماه`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
