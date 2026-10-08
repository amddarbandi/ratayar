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

interface Detail {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  referenceType?: string;
  referenceId?: string;
  user: { id: string; phone: string };
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  messages: Message[];
}

const STATUSES: Record<string, string> = {
  open: 'باز',
  answered: 'پاسخ داده',
  pending_user: 'در انتظار کاربر',
  closed: 'بسته',
};

export default function AdminTicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [pendingStatus, setPendingStatus] = useState('');

  const load = () => {
    ticketApi
      .get(id)
      .then((res) => setData(res.data))
      .catch(() => setError('تیکت یافت نشد'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await ticketApi.adminReply(id, reply);
      setReply('');
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در ارسال');
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async () => {
    if (!pendingStatus) return;
    setChangingStatus(true);
    try {
      await ticketApi.adminSetStatus(
        id,
        pendingStatus,
        statusNote || undefined,
      );
      setPendingStatus('');
      setStatusNote('');
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در تغییر وضعیت');
    } finally {
      setChangingStatus(false);
    }
  };

  if (loading)
    return <div className="text-white/40">در حال بارگذاری...</div>;
  if (!data) return <div className="text-red-400">{error}</div>;

  const isClosed = data.status === 'closed';

  return (
    <div dir="rtl">
      <Link
        href="/admin/tickets"
        className="text-sm text-blue-400 hover:underline mb-4 inline-block"
      >
        ← بازگشت به صندوق
      </Link>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white">{data.subject}</h1>
            <div className="text-white/60 text-sm mt-1">
              کاربر: <span className="font-mono" dir="ltr">{data.user.phone}</span>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
            {STATUSES[data.status] || data.status}
          </span>
        </div>
      </div>

      {/* Status change panel */}
      {!isClosed && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
          <div className="text-sm text-white/70 mb-3">تغییر وضعیت</div>
          <div className="flex gap-2 flex-wrap mb-3">
            {['open', 'answered', 'pending_user', 'closed'].map((s) => (
              <button
                key={s}
                onClick={() => setPendingStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs ${
                  pendingStatus === s
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
              >
                {STATUSES[s]}
              </button>
            ))}
          </div>
          {pendingStatus && (
            <>
              <textarea
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white text-sm h-20 mb-2"
                placeholder="یادداشت همراه تغییر وضعیت (اختیاری)"
              />
              <button
                onClick={changeStatus}
                disabled={changingStatus}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                {changingStatus ? 'در حال اعمال...' : 'اعمال تغییر'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="space-y-3 mb-6">
        {data.messages.map((m) => {
          const isAdmin = m.senderRole === 'admin';
          return (
            <div
              key={m.id}
              className={`rounded-2xl p-4 ${
                isAdmin
                  ? 'bg-purple-500/10 border border-purple-500/30 mr-12'
                  : 'bg-white/5 border border-white/10 ml-12'
              }`}
            >
              <div className="flex justify-between items-center mb-2 text-xs text-white/50">
                <span className="font-bold text-white/70">
                  {isAdmin ? '👤 پشتیبانی' : `👤 ${m.sender?.phone || 'کاربر'}`}
                </span>
                <span>{new Date(m.createdAt).toLocaleString('fa-IR')}</span>
              </div>
              <div className="text-white text-sm whitespace-pre-wrap leading-6">
                {m.body}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {!isClosed ? (
        <form
          onSubmit={send}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-24 mb-3"
            placeholder="پاسخ ادمین..."
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !reply.trim()}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            {sending ? 'در حال ارسال...' : 'ارسال پاسخ ادمین'}
          </button>
        </form>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-white/50 text-sm">
          این تیکت بسته است.
        </div>
      )}
    </div>
  );
}
