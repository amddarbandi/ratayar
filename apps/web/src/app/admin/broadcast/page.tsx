'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Megaphone, Send, Users, Crown, Shield, Loader2, CheckCircle2,
  XCircle, Clock, RefreshCw,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliDateTime } from '@/lib/jalali';

type Channel = 'in_app' | 'sms' | 'email';
type Audience = 'all' | 'plan:free' | 'plan:personal' | 'plan:family' | 'plan:business' | 'role:user' | 'role:admin';

interface BcRow {
  id: string;
  channel: string;
  audience: string;
  title: string;
  body: string;
  priority: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  finishedAt: string | null;
}

const STATUS_MAP: Record<string, { text: string; cls: string; icon: any }> = {
  queued: { text: 'در صف', cls: 'bg-amber-500/20 text-amber-300', icon: Clock },
  sending: { text: 'در حال ارسال', cls: 'bg-cyan-500/20 text-cyan-300', icon: Loader2 },
  sent: { text: 'ارسال شد', cls: 'bg-emerald-500/20 text-emerald-300', icon: CheckCircle2 },
  failed: { text: 'خطا', cls: 'bg-red-500/20 text-red-300', icon: XCircle },
};

export default function AdminBroadcastPage() {
  const [items, setItems] = useState<BcRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // form
  const [channel, setChannel] = useState<Channel>('in_app');
  const [audience, setAudience] = useState<Audience>('all');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');
  const [scheduledFor, setScheduledFor] = useState('');

  const load = () => {
    setLoading(true);
    adminApi
      .listBroadcasts({ limit: 30 })
      .then((res) => {
        setItems(res.data.items);
        setTotal(res.data.total);
      })
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('عنوان و متن الزامی است');
      return;
    }
    if (!confirm(`ارسال به «${audienceLabel(audience)}» از طریق «${channelLabel(channel)}»؟`)) return;

    setSubmitting(true);
    try {
      const res = await adminApi.createBroadcast({
        channel,
        audience,
        title: title.trim(),
        body: body.trim(),
        priority,
        scheduledFor: scheduledFor || undefined,
      });
      toast.success(
        `در صف ارسال قرار گرفت — ${res.data.recipientCount} گیرنده`,
      );
      setTitle('');
      setBody('');
      setScheduledFor('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ارسال');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-500 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            ارسال پیام گروهی
          </h1>
        </div>
        <p className="text-white/50 text-sm">
          پیام خود را به گروه‌های مختلف کاربران بفرستید
        </p>
      </div>

      {/* Compose card */}
      <Card>
        <CardContent className="p-5 md:p-6 space-y-5">
          {/* Channel */}
          <div>
            <div className="text-sm text-white/70 mb-2">کانال ارسال</div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { key: 'in_app', label: 'داخل اپ' },
                  { key: 'sms', label: 'پیامک', disabled: true },
                  { key: 'email', label: 'ایمیل', disabled: true },
                ] as const
              ).map((c: any) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => !c.disabled && setChannel(c.key)}
                  disabled={c.disabled}
                  className={cn(
                    'min-h-[44px] rounded-xl text-sm font-medium border transition-all',
                    channel === c.key
                      ? 'bg-purple-500/20 border-purple-500/50 text-white'
                      : c.disabled
                        ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                        : 'bg-white/5 border-white/10 text-white/60',
                  )}
                >
                  {c.label}
                  {c.disabled && (
                    <span className="block text-[10px] text-white/30">
                      به‌زودی
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div>
            <div className="text-sm text-white/70 mb-2">مخاطبان</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                { key: 'all', label: 'همه کاربران', icon: Users },
                { key: 'plan:free', label: 'پلن رایگان', icon: Crown },
                { key: 'plan:personal', label: 'پلن شخصی', icon: Crown },
                { key: 'plan:family', label: 'پلن خانواده', icon: Crown },
                { key: 'plan:business', label: 'پلن کسب‌وکار', icon: Crown },
                { key: 'role:user', label: 'کاربران عادی', icon: Users },
                { key: 'role:admin', label: 'ادمین‌ها', icon: Shield },
              ].map((a) => (
                <button
                  key={a.key}
                  type="button"
                  onClick={() => setAudience(a.key as Audience)}
                  className={cn(
                    'min-h-[44px] flex items-center gap-2 px-3 rounded-xl text-xs font-medium border transition-all',
                    audience === a.key
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60',
                  )}
                >
                  <a.icon className="w-3.5 h-3.5" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              عنوان *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: به‌روزرسانی جدید راتایار"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-base"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              متن *
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              placeholder="متن کامل پیام..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 text-base resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <div className="text-sm text-white/70 mb-2">اولویت</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'normal', label: 'عادی' },
                { key: 'important', label: 'مهم' },
                { key: 'critical', label: 'بحرانی' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPriority(p.key)}
                  className={cn(
                    'min-h-[44px] rounded-xl text-sm font-medium border',
                    priority === p.key
                      ? 'bg-amber-500/20 border-amber-500/50 text-white'
                      : 'bg-white/5 border-white/10 text-white/60',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Schedule (optional) */}
          <div>
            <label className="block text-sm text-white/70 mb-2">
              زمان‌بندی (اختیاری)
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 text-base"
              dir="ltr"
            />
            <div className="text-[11px] text-white/40 mt-1">
              خالی بگذارید تا فوراً ارسال شود.
            </div>
          </div>

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                ارسال پیام
              </>
            )}
          </button>
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-white">
              تاریخچه ({total.toLocaleString('fa-IR')})
            </h2>
            <button
              onClick={load}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            </button>
          </div>

          {loading && items.length === 0 && (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-white/40 text-sm text-center py-6">
              هنوز پیام گروهی ارسال نشده است.
            </div>
          )}

          <div className="space-y-2">
            {items.map((b, i) => {
              const st = STATUS_MAP[b.status] || STATUS_MAP.queued;
              const Icon = st.icon;
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="text-white font-medium text-sm flex-1 min-w-0 truncate">
                      {b.title}
                    </div>
                    <span
                      className={cn(
                        'flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap',
                        st.cls,
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-3 h-3',
                          b.status === 'sending' && 'animate-spin',
                        )}
                      />
                      {st.text}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-white/50">
                    <span className="px-2 py-0.5 rounded-full bg-white/5">
                      {channelLabel(b.channel)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/5">
                      {audienceLabel(b.audience)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
                      {b.sentCount.toLocaleString('fa-IR')} / {b.recipientCount.toLocaleString('fa-IR')}
                    </span>
                    {b.failedCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-300">
                        {b.failedCount} خطا
                      </span>
                    )}
                    <span className="mr-auto text-white/40">
                      {toJalaliDateTime(b.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function channelLabel(c: string) {
  return c === 'in_app' ? 'داخل اپ' : c === 'sms' ? 'پیامک' : 'ایمیل';
}
function audienceLabel(a: string) {
  if (a === 'all') return 'همه';
  if (a === 'role:user') return 'کاربران عادی';
  if (a === 'role:admin') return 'ادمین‌ها';
  if (a.startsWith('plan:')) {
    const m: Record<string, string> = {
      free: 'رایگان',
      personal: 'شخصی',
      family: 'خانواده',
      business: 'کسب‌وکار',
    };
    return `پلن ${m[a.slice(5)] || a.slice(5)}`;
  }
  return a;
}
