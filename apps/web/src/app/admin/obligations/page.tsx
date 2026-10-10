'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, RefreshCw, Trash2, ListChecks, ChevronLeft, CheckSquare, Square,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliString } from '@/lib/jalali';

interface Obligation {
  id: string;
  title: string;
  dueDate: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  user: { id: string; phone: string; fullName: string | null } | null;
}

const CATS = [
  { key: '', label: 'همه' },
  { key: 'financial', label: 'مالی' },
  { key: 'health', label: 'سلامت' },
  { key: 'life', label: 'زندگی' },
  { key: 'family', label: 'خانواده' },
  { key: 'business', label: 'کسب‌وکار' },
];

const PRIORITY_MAP: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300',
  important: 'bg-amber-500/20 text-amber-300',
  normal: 'bg-cyan-500/20 text-cyan-300',
  optional: 'bg-white/10 text-white/60',
};

export default function AdminObligationsPage() {
  const [items, setItems] = useState<Obligation[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [offset, setOffset] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [acting, setActing] = useState(false);
  const limit = 30;

  const load = () => {
    setLoading(true);
    adminApi
      .obligations({ q, category, limit, offset })
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
        setSelected(new Set());
      })
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, offset]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((o) => o.id)));
  };

  const doBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} تعهد حذف شود؟ این کار قابل بازگشت نیست.`)) return;
    setActing(true);
    try {
      const res = await adminApi.bulkDeleteObligations(Array.from(selected));
      toast.success(`${res.data.deleted} تعهد حذف شد`);
      load();
    } catch {
      toast.error('خطا در حذف گروهی');
    } finally {
      setActing(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const allSelected = items.length > 0 && selected.size === items.length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          تعهدات کاربران
        </h1>
        <p className="text-white/50 text-sm">
          {total.toLocaleString('fa-IR')} تعهد در پلتفرم
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
          placeholder="جستجو در عنوان تعهد..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-base"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATS.map((c) => (
          <button
            key={c.key}
            onClick={() => {
              setCategory(c.key);
              setOffset(0);
            }}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap border',
              category === c.key
                ? 'bg-purple-500/20 border-purple-500/40 text-white'
                : 'bg-white/5 border-white/10 text-white/60',
            )}
          >
            {c.label}
          </button>
        ))}
        <button
          onClick={load}
          className="ml-auto px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Bulk bar */}
      {items.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-3">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 text-white/70 text-sm min-h-[36px]"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 text-purple-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            انتخاب همه این صفحه
          </button>
          {selected.size > 0 && (
            <button
              onClick={doBulkDelete}
              disabled={acting}
              className="min-h-[40px] px-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              حذف {selected.size.toLocaleString('fa-IR')} مورد
            </button>
          )}
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
          تعهدی یافت نشد.
        </div>
      )}

      <div className="space-y-2">
        {items.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              'rounded-2xl border p-4 transition-all',
              selected.has(o.id)
                ? 'border-purple-500/40 bg-purple-500/5'
                : 'border-white/10 bg-white/[0.03]',
            )}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => toggle(o.id)}
                className="min-h-[44px] min-w-[44px] -ml-2 -mt-1 flex items-center justify-center flex-shrink-0"
              >
                {selected.has(o.id) ? (
                  <CheckSquare className="w-5 h-5 text-purple-400" />
                ) : (
                  <Square className="w-5 h-5 text-white/40" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-white font-medium text-sm truncate">
                    {o.title}
                  </div>
                  <span
                    className={cn(
                      'text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap',
                      PRIORITY_MAP[o.priority] || PRIORITY_MAP.normal,
                    )}
                  >
                    {o.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
                  <Link
                    href={`/admin/users/${o.user?.id || ''}`}
                    className="flex items-center gap-1 text-white/60 hover:text-white"
                  >
                    {o.user?.fullName || '—'} •{' '}
                    <span className="font-mono" dir="ltr">
                      {o.user?.phone || '?'}
                    </span>
                    <ChevronLeft className="w-3 h-3" />
                  </Link>
                  <div className="flex items-center gap-2 text-white/40">
                    <span>{o.category}</span>
                    <span>{toJalaliString(o.dueDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
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
