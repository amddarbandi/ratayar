'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, User, ChevronLeft, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface UserRow {
  id: string;
  phone: string;
  fullName: string | null;
  role: string;
  status: string;
  createdAt: string;
  plan: string;
  planName: string;
}

const STATUS_MAP: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300',
  banned: 'bg-red-500/20 text-red-300',
  pending: 'bg-amber-500/20 text-amber-300',
};

const ROLE_MAP: Record<string, string> = {
  admin: 'bg-fuchsia-500/20 text-fuchsia-300',
  support: 'bg-cyan-500/20 text-cyan-300',
  billing: 'bg-amber-500/20 text-amber-300',
  analyst: 'bg-blue-500/20 text-blue-300',
  user: 'bg-white/10 text-white/60',
};

export default function AdminUsersPage() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [offset, setOffset] = useState(0);
  const limit = 30;

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers({ q, status, role, limit, offset });
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch {
      toast.error('خطا در بارگذاری کاربران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, status, role, offset]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          کاربران
        </h1>
        <p className="text-white/50 text-sm">
          {total.toLocaleString('fa-IR')} کاربر در پلتفرم
        </p>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute top-1/2 right-3 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
          <input
            type="text"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOffset(0);
            }}
            placeholder="جستجو با شماره یا نام..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pr-10 pl-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-base"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: '', label: 'همه' },
            { key: 'active', label: 'فعال' },
            { key: 'banned', label: 'مسدود' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setStatus(s.key);
                setOffset(0);
              }}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border',
                status === s.key
                  ? 'bg-purple-500/20 border-purple-500/40 text-white'
                  : 'bg-white/5 border-white/10 text-white/60',
              )}
            >
              {s.label}
            </button>
          ))}
          <div className="w-px bg-white/10 mx-1" />
          {[
            { key: '', label: 'همه نقش‌ها' },
            { key: 'user', label: 'کاربر' },
            { key: 'admin', label: 'ادمین' },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => {
                setRole(s.key);
                setOffset(0);
              }}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border',
                role === s.key
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-white'
                  : 'bg-white/5 border-white/10 text-white/60',
              )}
            >
              {s.label}
            </button>
          ))}
          <button
            onClick={load}
            className="ml-auto px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white"
            aria-label="به‌روزرسانی"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {loading && items.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
          کاربری یافت نشد.
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60">
            <tr>
              <th className="p-3 text-right">شماره</th>
              <th className="p-3 text-right">نام</th>
              <th className="p-3 text-right">نقش</th>
              <th className="p-3 text-right">وضعیت</th>
              <th className="p-3 text-right">پلن</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            {items.map((u) => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-3 font-mono text-xs" dir="ltr">{u.phone}</td>
                <td className="p-3">{u.fullName || '—'}</td>
                <td className="p-3">
                  <span className={cn('text-xs px-2 py-1 rounded-full', ROLE_MAP[u.role] || ROLE_MAP.user)}>
                    {u.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className={cn('text-xs px-2 py-1 rounded-full', STATUS_MAP[u.status] || STATUS_MAP.active)}>
                    {u.status}
                  </span>
                </td>
                <td className="p-3 text-xs">{u.planName}</td>
                <td className="p-3">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="inline-flex items-center text-purple-400 hover:text-purple-300 text-xs"
                  >
                    جزئیات
                    <ChevronLeft className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {items.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/admin/users/${u.id}`}
              className="block rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {u.fullName?.charAt(0) || <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-medium text-sm truncate">
                      {u.fullName || 'بدون نام'}
                    </div>
                    <div className="text-white/50 text-xs font-mono" dir="ltr">
                      {u.phone}
                    </div>

                  </div>
               </div>
                <span className={cn('text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap', STATUS_MAP[u.status] || STATUS_MAP.active)}>
                  {u.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className={cn('px-2 py-0.5 rounded-full', ROLE_MAP[u.role] || ROLE_MAP.user)}>
                  {u.role}
                </span>
                <span className="text-white/50">{u.planName}</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={offset === 0}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 disabled:opacity-30 text-sm"
          >
            قبلی
          </button>
          <div className="text-white/50 text-xs">
            صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          </div>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 disabled:opacity-30 text-sm"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
