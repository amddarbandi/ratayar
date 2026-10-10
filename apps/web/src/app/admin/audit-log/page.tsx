'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, Search, Activity } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliDateTime } from '@/lib/jalali';

interface AuditItem {
  id: string;
  actorId: string | null;
  actorPhone: string | null;
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  meta: any;
  ip: string | null;
  createdAt: string;
}

export default function AdminAuditLogPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [targetType, setTargetType] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 50;

  const load = () => {
    setLoading(true);
    adminApi
      .auditLog({
        limit,
        offset,
        action: q || undefined,
        targetType: targetType || undefined,
      })
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
  }, [q, targetType, offset]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          لاگ اقدامات
        </h1>
        <p className="text-white/50 text-sm">
          هر اقدام ادمین اینجا ثبت می‌شود
        </p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOffset(0);
          }}
          placeholder="جستجو در action..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-base"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: '', label: 'همه' },
          { key: 'user', label: 'کاربر' },
          { key: 'payment', label: 'پرداخت' },
          { key: 'document', label: 'سند' },
          { key: 'obligation', label: 'تعهد' },
          { key: 'subscription', label: 'اشتراک' },
          { key: 'notification', label: 'اعلان' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTargetType(t.key);
              setOffset(0);
            }}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-medium border whitespace-nowrap',
              targetType === t.key
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
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <Activity className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <div className="text-white/40 text-sm">
            هنوز اقدام ادمینی ثبت نشده است.
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map((a) => {
          const failed = a.action.endsWith('.failed');
          return (
            <div
              key={a.id}
              className={cn(
                'rounded-2xl border p-3 md:p-4',
                failed
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-white/10 bg-white/[0.03]',
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      failed ? 'bg-red-400' : 'bg-cyan-400',
                    )}
                  />
                  <span className="text-white font-mono text-xs md:text-sm break-all">
                    {a.action}
                  </span>
                </div>
                <span className="text-white/40 text-[11px] flex-shrink-0">
                  {toJalaliDateTime(a.createdAt)}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {a.actorPhone && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/60 font-mono" dir="ltr">
                    {a.actorPhone}
                  </span>
                )}
                {a.actorRole && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
                    {a.actorRole}
                  </span>
                )}
                {a.targetType && (
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300">
                    {a.targetType}
                    {a.targetId ? `:${a.targetId.slice(0, 8)}` : ''}
                  </span>
                )}
                {a.ip && (
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-mono" dir="ltr">
                    {a.ip}
                  </span>
                )}
              </div>
            </div>
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
            صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
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
