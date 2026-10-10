'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, RefreshCw, Trash2, FileText, ExternalLink, ChevronLeft } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliString } from '@/lib/jalali';

interface Doc {
  id: string;
  name: string;
  type: string;
  mimeType: string;
  size: number;
  sizeMB: number;
  storageKey: string;
  createdAt: string;
  expiresAt: string | null;
  user: { id: string; phone: string; fullName: string | null } | null;
}

const TYPES = [
  { key: '', label: 'همه' },
  { key: 'identity', label: 'هویتی' },
  { key: 'property', label: 'ملکی' },
  { key: 'vehicle', label: 'خودرو' },
  { key: 'insurance', label: 'بیمه' },
  { key: 'medical', label: 'پزشکی' },
  { key: 'business', label: 'کسب‌وکار' },
  { key: 'family', label: 'خانواده' },
  { key: 'other', label: 'سایر' },
];

export default function AdminDocumentsPage() {
  const [items, setItems] = useState<Doc[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 30;

  const load = () => {
    setLoading(true);
    adminApi
      .documents({ q, type, limit, offset })
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
  }, [q, type, offset]);

  const doDelete = async (d: Doc) => {
    if (!confirm(`سند «${d.name}» حذف شود؟ این کار فایل را از MinIO هم پاک می‌کند.`)) return;
    try {
      await adminApi.deleteDocument(d.id);
      toast.success('سند حذف شد');
      load();
    } catch {
      toast.error('خطا در حذف');
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const totalMB = items.reduce((s, d) => s + d.sizeMB, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          اسناد کاربران
        </h1>
        <p className="text-white/50 text-sm">
          {total.toLocaleString('fa-IR')} سند •{' '}
          {totalMB.toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت در این صفحه
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
          placeholder="جستجو در نام سند..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-base"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setType(t.key);
              setOffset(0);
            }}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap border',
              type === t.key
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

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
          سندی یافت نشد.
        </div>
      )}

      <div className="space-y-2">
        {items.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-white font-medium text-sm truncate">
                    {d.name}
                  </div>
                  <div className="text-white/40 text-[11px] font-mono" dir="ltr">
                    {d.mimeType} • {d.sizeMB} MB
                  </div>
                </div>
              </div>
              <button
                onClick={() => doDelete(d)}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex-shrink-0"
                aria-label="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] flex-wrap gap-2">
              <Link
                href={`/admin/users/${d.user?.id || ''}`}
                className="flex items-center gap-1 text-white/60 hover:text-white"
              >
                {d.user?.fullName || '—'} •{' '}
                <span className="font-mono" dir="ltr">{d.user?.phone || '?'}</span>
                <ChevronLeft className="w-3 h-3" />
              </Link>
              <span className="text-white/40">{toJalaliString(d.createdAt)}</span>
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
