'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ticketApi } from '@/lib/api';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  referenceType?: string;
  referenceId?: string;
  messageCount: number;
  user: { id: string; phone: string };
  createdAt: string;
  updatedAt: string;
}

const STATUSES: Record<string, { text: string; cls: string }> = {
  open: { text: 'باز', cls: 'bg-blue-500/20 text-blue-300' },
  answered: { text: 'پاسخ داده', cls: 'bg-green-500/20 text-green-300' },
  pending_user: {
    text: 'در انتظار کاربر',
    cls: 'bg-yellow-500/20 text-yellow-300',
  },
  closed: { text: 'بسته', cls: 'bg-gray-500/20 text-gray-400' },
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
  const statusFilter = params.get('status') || '';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [status, setStatus] = useState(statusFilter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (s?: string) => {
    setLoading(true);
    ticketApi
      .adminAll(s || undefined)
      .then((res) => setTickets(res.data))
      .catch(() => setError('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(status || undefined);
  }, [status]);

  const tabs = [
    { key: '', label: 'همه' },
    { key: 'open', label: 'باز' },
    { key: 'answered', label: 'پاسخ داده' },
    { key: 'pending_user', label: 'در انتظار کاربر' },
    { key: 'closed', label: 'بسته' },
  ];

  return (
    <div dir="rtl">
      <h1 className="text-3xl font-bold text-white mb-6">صندوق تیکت‌ها</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              status === t.key
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && <div className="text-white/40">در حال بارگذاری...</div>}

      {!loading && tickets.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/50">
          تیکتی یافت نشد.
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="space-y-3">
          {tickets.map((t) => {
            const st = STATUSES[t.status] || STATUSES.open;
            return (
              <Link
                key={t.id}
                href={`/admin/tickets/${t.id}`}
                className="block bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl p-5 transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="text-white font-bold text-lg">
                      {t.subject}
                    </div>
                    <div className="text-white/60 text-sm mt-1">
                      {t.user.phone}
                      {t.referenceType && (
                        <span className="mr-2 text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
                          {t.referenceType === 'payment_request'
                            ? 'پرداخت'
                            : t.referenceType}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${st.cls}`}
                    >
                      {st.text}
                    </span>
                    <span className="text-[10px] text-white/40">
                      {PRIORITIES[t.priority]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-white/40">
                  <span>{CATEGORIES[t.category] || t.category}</span>
                  <span>💬 {t.messageCount}</span>
                  <span>{new Date(t.updatedAt).toLocaleString('fa-IR')}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense fallback={<div className="text-white/40">بارگذاری...</div>}>
      <Content />
    </Suspense>
  );
}
