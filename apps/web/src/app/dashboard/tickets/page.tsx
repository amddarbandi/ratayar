'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare, Plus, X, Loader2, Send, ChevronLeft,
} from 'lucide-react';
import { ticketApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
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
  open: { text: 'باز', cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  answered: {
    text: 'پاسخ داده شد',
    cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  pending_user: {
    text: 'در انتظار شما',
    cls: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  closed: {
    text: 'بسته',
    cls: 'bg-white/10 text-white/50 border-white/20',
  },
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

  const load = () => {
    setLoading(true);
    ticketApi
      .mine()
      .then((res) => setTickets(res.data))
      .catch(() => toast.error('خطا در بارگذاری تیکت‌ها'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) {
      toast.error('موضوع و متن الزامی است');
      return;
    }
    setSubmitting(true);
    try {
      await ticketApi.create({ subject, category, priority, body });
      toast.success('تیکت ثبت شد');
      setSubject('');
      setBody('');
      setCategory('other');
      setPriority('normal');
      setShowForm(false);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ثبت تیکت');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            تیکت‌های پشتیبانی
          </h1>
          <p className="text-white/50">
            گفتگو مستقیم با تیم پشتیبانی راتایار
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className={cn(
            'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all shadow-lg hover:scale-105',
            showForm
              ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-purple-500/30',
          )}
        >
          {showForm ? (
            <>
              <X className="w-5 h-5" />
              انصراف
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              تیکت جدید
            </>
          )}
        </button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">تیکت جدید</h2>
              </div>

              <Input
                label="موضوع"
                placeholder="خلاصه‌ای از مشکل یا درخواست"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    دسته
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CATEGORIES).map(([k, v]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCategory(k)}
                        className={cn(
                          'p-2.5 rounded-xl text-xs font-medium transition-all border',
                          category === k
                            ? 'bg-purple-500/20 border-purple-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    اولویت
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(PRIORITIES).map(([k, v]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setPriority(k)}
                        className={cn(
                          'p-2.5 rounded-xl text-xs font-medium transition-all border',
                          priority === k
                            ? 'bg-purple-500/20 border-purple-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10',
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  توضیحات
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="جزئیات مشکل یا درخواست خود را بنویسید..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-purple-500/10 transition-all resize-none"
                />
              </div>

              <Button
                type="button"
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={submit}
                disabled={submitting}
                isLoading={submitting}
              >
                <Send className="w-5 h-5" />
                ارسال تیکت
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-3xl bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              هنوز تیکتی ثبت نکردی
            </h3>
            <p className="text-white/50 mb-6">
              اگر سؤالی داری یا مشکلی پیش آمده، تیکت جدید بساز
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              ساخت اولین تیکت
            </button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((t, i) => {
            const st = STATUSES[t.status] || STATUSES.open;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link href={`/dashboard/tickets/${t.id}`}>
                  <Card className="hover:border-purple-500/30 transition-all cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-white text-lg flex-1">
                          {t.subject}
                        </h3>
                        <span
                          className={cn(
                            'px-3 py-1 rounded-full text-xs border whitespace-nowrap',
                            st.cls,
                          )}
                        >
                          {st.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/50 flex-wrap">
                        <span>{CATEGORIES[t.category] || t.category}</span>
                        <span>اولویت: {PRIORITIES[t.priority]}</span>
                        <span>💬 {t.messageCount} پیام</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
