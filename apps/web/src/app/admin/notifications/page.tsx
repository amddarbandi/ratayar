'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, RefreshCw, Bell, RotateCcw, ChevronLeft, Clock, CheckCircle2,
  XCircle, AlertCircle, Send,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliDateTime } from '@/lib/jalali';

interface Notif {
  id: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  body: string | null;
  scheduledFor: string | null;
  sentAt: string | null;
  readAt: string | null;
  createdAt: string;
  user: { id: string; phone: string; fullName: string | null } | null;
}

const STATUS_MAP: Record<string, { text: string; cls: string; icon: any }> = {
  pending: { text: 'در انتظار', cls: 'bg-amber-500/20 text-amber-300', icon: Clock },
  sent: { text: 'ارسال شده', cls: 'bg-cyan-500/20 text-cyan-300', icon: Send },
  read: { text: 'خوانده شده', cls: 'bg-emerald-500/20 text-emerald-300', icon: CheckCircle2 },
  failed: { text: 'خطا', cls: 'bg-red-500/20 text-red-300', icon: XCircle },
};

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<Notif[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [offset, setOffset] = useState(0);
  const [retrying, setRetrying] = useState<string | null>(null);
  const limit = 30;

  const load = () => {
    setLoading(true);
    adminApi
      .notifications({ status, limit, offset })
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
  }, [status, offset]);

  const doRetry = async (n: Notif) => {
    setRetrying(n.id);
    try {
      await adminApi.retryNotification(n.id);
      toast.success('برای ارسال مجدد ثبت شد');
      load();
    } catch {
      toast.error('خطا در تلاش مجدد');
    } finally {
      setRetrying(null);
    }
  };

  const filtered = q
    ? items.filter(
        (n) =>
          n.title.toLowerCase().includes(q.toLowerCase()) ||
          (n.user?.phone || '').includes(q),
      )
    : items;

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  const tabs = [
    { key: '', label: 'همه' },
    { key: 'pending', label: 'در انتظار' },
    { key: 'sent', label: 'ارسال شده' },
    { key: 'read', label: 'خوانده شده' },
    { key: 'failed', label: 'خطا' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          اعلان‌ها
        </h1>
        <p className="text-white/50 text-sm">
          {total.toLocaleString('fa-IR')} اعلان در سیستم
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو در عنوان یا شماره کاربر..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-base"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setStatus(t.key);
              setOffset(0);
            }}
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
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <Bell className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <div className="text-white/40 text-sm">اعلانی یافت نشد.</div>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((n, i) => {
          const st = STATUS_MAP[n.status] || {
            text: n.status,
            cls: 'bg-white/10 text-white/60',
            icon: AlertCircle,
          };
          const Icon = st.icon;
          return (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2 min-w-0 flex-1">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0',
                      st.cls,
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-white text-sm font-medium truncate">
                      {n.title}
                    </div>
                    {n.body && (
                      <div className="text-white/50 text-[11px] line-clamp-2 mt-0.5">
                        {n.body}
                      </div>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    'text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap',
                    st.cls,
                  )}
                >
                  {st.text}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
                <Link
                  href={`/admin/users/${n.user?.id || ''}`}
                  className="flex items-center gap-1 text-white/60 hover:text-white"
                >
                  {n.user?.fullName || '—'} •{' '}
                  <span className="font-mono" dir="ltr">
                    {n.user?.phone || '?'}
                  </span>
                  <ChevronLeft className="w-3 h-3" />
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-white/40">
                    {toJalaliDateTime(n.createdAt)}
                  </span>
                  {n.status === 'failed' && (
                    <button
                      onClick={() => doRetry(n)}
                      disabled={retrying === n.id}
                      className="min-h-[32px] px-3 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1 disabled:opacity-50"
                    >
                      <RotateCcw
                        className={cn(
                          'w-3 h-3',
                          retrying === n.id && 'animate-spin',
                        )}
                      />
                      تلاش مجدد
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 disabled:opacity-30 text-sm min-h-[44px]"
          >
            قبلی
          </button>
          <div className="text-white/50 text-xs">
            صفحه {currentPage.toLocaleString('fa-IR')} از{' '}
            {totalPages.toLocaleString('fa-IR')}
          </div>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 disabled:opacity-30 text-sm min-h-[44px]"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
