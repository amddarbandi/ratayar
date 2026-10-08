'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ticketApi } from '@/lib/api';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

const CATEGORIES: Record<string, string> = {
  bug: 'باگ / خطا',
  feature: 'درخواست قابلیت',
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

const STATUSES: Record<string, { text: string; cls: string }> = {
  open: { text: 'باز', cls: 'bg-blue-100 text-blue-800' },
  answered: { text: 'پاسخ داده شد', cls: 'bg-green-100 text-green-800' },
  pending_user: { text: 'در انتظار شما', cls: 'bg-yellow-100 text-yellow-800' },
  closed: { text: 'بسته', cls: 'bg-gray-200 text-gray-700' },
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('normal');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    ticketApi
      .mine()
      .then((res) => setTickets(res.data))
      .catch(() => setError('خطا در بارگذاری تیکت‌ها'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!subject || !body) {
      setError('موضوع و متن الزامی است');
      return;
    }
    setSubmitting(true);
    try {
      await ticketApi.create({ subject, category, priority, body });
      setSubject('');
      setBody('');
      setCategory('other');
      setPriority('normal');
      setShowForm(false);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در ثبت تیکت');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">تیکت‌های پشتیبانی</h1>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            {showForm ? 'انصراف' : '+ تیکت جدید'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={submit}
            className="bg-white rounded-2xl shadow p-6 mb-6"
          >
            <h2 className="text-lg font-bold mb-4">ایجاد تیکت جدید</h2>

            <div className="mb-4">
              <label className="block text-sm mb-1">موضوع *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="خلاصه‌ای از مشکل یا درخواست"
                required
                minLength={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm mb-1">دسته</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">اولویت</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border rounded-lg p-2"
                >
                  {Object.entries(PRIORITIES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">توضیحات *</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full border rounded-lg p-2 h-32"
                placeholder="جزئیات مشکل یا درخواست خود را بنویسید..."
                required
                minLength={5}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
            >
              {submitting ? 'در حال ارسال...' : 'ارسال تیکت'}
            </button>
          </form>
        )}

        {loading && (
          <div className="text-center text-gray-500 py-10">در حال بارگذاری...</div>
        )}

        {!loading && tickets.length === 0 && (
          <div className="bg-white rounded-2xl shadow p-10 text-center text-gray-500">
            هنوز تیکتی ثبت نکرده‌اید.
          </div>
        )}

        {!loading && tickets.length > 0 && (
          <div className="space-y-3">
            {tickets.map((t) => {
              const st = STATUSES[t.status] || STATUSES.open;
              return (
                <Link
                  key={t.id}
                  href={`/dashboard/tickets/${t.id}`}
                  className="block bg-white rounded-2xl shadow hover:shadow-md transition p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg">{t.subject}</div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${st.cls}`}
                    >
                      {st.text}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500 flex-wrap">
                    <span>دسته: {CATEGORIES[t.category] || t.category}</span>
                    <span>اولویت: {PRIORITIES[t.priority] || t.priority}</span>
                    <span>💬 {t.messageCount} پیام</span>
                    <span>
                      آخرین به‌روز:{' '}
                      {new Date(t.updatedAt).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
