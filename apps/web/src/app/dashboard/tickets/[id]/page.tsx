'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Send } from 'lucide-react';
import { ticketApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliDateTime } from '@/lib/jalali';

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
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  messages: Message[];
}

const STATUSES: Record<string, { text: string; cls: string }> = {
  open: {
    text: 'باز',
    cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  },
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

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    ticketApi
      .get(id)
      .then((res) => setTicket(res.data))
      .catch(() => toast.error('تیکت یافت نشد'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const send = async () => {
    if (!reply.trim()) return;
    setSending(true);
    try {
      await ticketApi.reply(id, reply);
      setReply('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ارسال پیام');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white/40 text-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        در حال بارگذاری...
      </div>
    );
  }

  if (!ticket) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-white/60">
          تیکت یافت نشد.
        </CardContent>
      </Card>
    );
  }

  const st = STATUSES[ticket.status] || STATUSES.open;
  const isClosed = ticket.status === 'closed';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/tickets"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{ticket.subject}</h1>
          <p className="text-white/50 text-sm">
            ایجاد: {toJalaliDateTime(ticket.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs border whitespace-nowrap',
            st.cls,
          )}
        >
          {st.text}
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-3">
        {ticket.messages.map((m, i) => {
          const isAdmin = m.senderRole === 'admin';
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                'rounded-3xl p-5 border backdrop-blur-xl',
                isAdmin
                  ? 'ml-12 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 border-purple-500/30'
                  : 'mr-12 bg-gradient-to-br from-white/[0.07] to-white/[0.02] border-white/10',
              )}
            >
              <div className="flex items-center justify-between mb-2 text-xs text-white/50">
                <span className="font-bold text-white/80">
                  {isAdmin ? '👤 پشتیبانی راتایار' : '👤 شما'}
                </span>
                <span>{toJalaliDateTime(m.createdAt)}</span>
              </div>
              <div className="text-white/90 text-sm whitespace-pre-wrap leading-7">
                {m.body}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Reply */}
      {isClosed ? (
        <Card>
          <CardContent className="p-5 text-center text-white/60 text-sm">
            این تیکت بسته شده است. برای پیگیری مجدد، تیکت جدید بسازید.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-5 space-y-4">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="پاسخ خود را بنویسید..."
              rows={4}
              disabled={sending}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-purple-500/10 transition-all resize-none"
            />
            <Button
              type="button"
              variant="gradient"
              size="lg"
              className="w-full"
              onClick={send}
              disabled={sending || !reply.trim()}
              isLoading={sending}
            >
              <Send className="w-5 h-5" />
              ارسال پاسخ
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
