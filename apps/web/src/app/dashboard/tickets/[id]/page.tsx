'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ticketApi } from '@/lib/api';

interface Message {
  id: string;
  body: string;
  senderRole: 'user' | 'admin';
  sender?: { id: string; phone: string; role: string } | null;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  referenceType?: string;
  referenceId?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  messages: Message[];
}

const STATUSES: Record<string, { text: string; cls: string }> = {
  open: { text: 'باز', cls: 'bg-blue-100 text-blue-800' },
  answered: { text: 'پاسخ داده شد', cls: 'bg-green-100 text-green-800' },
  pending_user: { text: 'در انتظار شما', cls: 'bg-yellow-100 text-yellow-800' },
  closed: { text: 'بسته', cls: 'bg-gray-200 text-gray-700' },
};

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    ticketApi
      .get(id)
      .then((res) => setTicket(res.data))
      .catch(() => setError('تیکت یافت نشد'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await ticketApi.reply(id, reply);
      setReply('');
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در ارسال پیام');
    } finally {
      setSending(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500" dir="rtl">
        در حال بارگذاری...
      </div>
    );
  if (error && !ticket)
    return (
      <div className="p-10 text-center text-red-600" dir="rtl">
        {error}
      </div>
    );
  if (!ticket) return null;

  const st = STATUSES[ticket.status] || STATUSES.open;
  const isClosed = ticket.status === 'closed';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard/tickets"
          className="text-sm text-blue-600 hover:underline mb-4 inline-block"
        >
          ← بازگشت به تیکت‌ها
        </Link>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <span className={`text-xs px-2 py-1 rounded-full ${st.cls}`}>
              {st.text}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            ایجاد: {new Date(ticket.createdAt).toLocaleString('fa-IR')}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {ticket.messages.map((m) => {
            const isAdmin = m.senderRole === 'admin';
            return (
              <div
                key={m.id}
                className={`rounded-2xl p-4 shadow ${
                  isAdmin
                    ? 'bg-blue-50 border border-blue-200 ml-8'
                    : 'bg-white mr-8'
                }`}
              >
                <div className="flex justify-between items-center mb-2 text-xs text-gray-500">
                  <span className="font-bold">
                    {isAdmin ? '👤 پشتیبانی' : '👤 شما'}
                  </span>
                  <span>{new Date(m.createdAt).toLocaleString('fa-IR')}</span>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-6">
                  {m.body}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {isClosed ? (
          <div className="bg-gray-100 border border-gray-300 rounded-2xl p-4 text-center text-gray-600 text-sm">
            این تیکت بسته شده است. برای پیگیری مجدد، تیکت جدید بسازید.
          </div>
        ) : (
          <form onSubmit={send} className="bg-white rounded-2xl shadow p-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full border rounded-lg p-3 h-24 mb-3"
              placeholder="پاسخ خود را بنویسید..."
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !reply.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
            >
              {sending ? 'در حال ارسال...' : 'ارسال پاسخ'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
