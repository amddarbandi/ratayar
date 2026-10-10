'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Search, RefreshCw, MessageSquare, User, ChevronLeft, Filter,
} from 'lucide-react';
import { ticketApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliDateTime } from '@/lib/jalali';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  referenceType?: string;
  referenceId?: string;
  assigneeId?: string | null;
  assignee?: { id: string; phone: string; fullName: string | null } | null;
  messageCount: number;
  user: { id: string; phone: string };
  createdAt: string;
  updatedAt: string;
}

const STATUSES: Record<string, { text: string; cls: string }> = {
  open: { text: 'باز', cls: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
  answered: { text: 'پاسخ داده', cls: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  pending_user: { text: 'در انتظار کاربر', cls: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  closed: { text: 'بسته', cls: 'bg-white/10 text-white/50 border border-white/20' },
};

const CATEGORIES: Record<string, string> = {
  bug: 'باگ',
  feature: 'قابلیت',
  billing: 'صورتحساب',
  payment: 'پرداخت',
  other: 'سایر',
};

const PRIORITIES: Record<string, string> = {
  low: 'کم',
  normal: 'معمولی',
  high: 'بالا',
  urgent: 'فوری',
};

function Content() {
  const params = useSearchParams();
  const initialStatus = params.get('status') || '';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState(initialStatus);
  const [assignFilter, setAssignFilter] = useState<
    'all' | 'me' | 'unassigned'
  >('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    const query: any = {};
    if (status) query.status = status;
    if (assignFilter === 'me') query.assignedTo = 'me';
    else if (assignFilter === 'unassigned') query.unassigned = true;

    ticketApi
      .adminAll(query)
      .then((res) => setTickets(res.data))
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, assignFilter]);

  const statusTabs = [
    { key: '', label: 'همه' },
    { key: 'open', label: 'باز' },
    { key: 'answered', label: 'پاسخ داده' },
    { key: 'pending_user', label: 'در انتظار کاربر' },
    { key: 'closed', label: 'بسته' },
  ];

  const assignTabs = [
    { key: 'all', label: 'همه', count: null },
    { key: 'me', label: 'اختصاص به من', count: null },
    { key: 'unassigned', label: 'بدون مسئول', count: null },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              صندوق تیکت‌ها
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            {tickets.length.toLocaleString('fa-IR')} تیکت
          </p>
        </div>
        <button
          onClick={() => load(true)}
          className="min-h-[44px] px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white flex items-center gap-2 text-sm"
        >
          <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          به‌روزرسانی
        </button>
      </div>

      {/* Assignment filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-white/40 self-center flex-shrink-0" />
        {assignTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setAssignFilter(t.key)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-all',
              assignFilter === t.key
                ? 'bg-cyan-500/20 border-cyan-500/40 text-white'
                : 'bg-white/5 border-white/10 text-white/60',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={cn(
              'px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap border transition-all',
              status === t.key
                ? 'bg-purple-500/20 border-purple-500/40 text-white'
                : 'bg-white/5 border-white/10 text-white/60',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <MessageSquare className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <div className="text-white/40 text-sm">تیکتی یافت نشد.</div>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="space-y-2">
          {tickets.map((t, i) => {
            const st = STATUSES[t.status] || STATUSES.open;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/admin/tickets/${t.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-4 transition"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm truncate">
                        {t.subject}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px]">
                        <span className="text-white/60 font-mono" dir="ltr">
                          {t.user.phone}
                        </span>
                        {t.referenceType === 'payment_request' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
                            پرداخت
                          </span>
                        )}
                        {t.assignee ? (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {t.assignee.fullName || t.assignee.phone}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                            بدون مسئول
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className={cn(
                          'text-[11px] px-2 py-0.5 rounded-full',
                          st.cls,
                        )}
                      >
                        {st.text}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {PRIORITIES[t.priority]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <div className="flex gap-3">
                      <span>{CATEGORIES[t.category] || t.category}</span>
                      <span>💬 {t.messageCount}</span>
                    </div>
                    <span>{toJalaliDateTime(t.updatedAt)}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense
      fallback={<div className="text-white/40 text-center py-8">بارگذاری...</div>}
    >
      <Content />
    </Suspense>
  );
}
