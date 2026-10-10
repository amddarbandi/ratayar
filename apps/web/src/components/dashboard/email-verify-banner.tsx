'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Loader2, Send } from 'lucide-react';
import { adminApi, api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

export function EmailVerifyBanner() {
  const user = useAuthStore((s) => s.user) as any;
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(true);
  const [dismissed, setDismissed] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;

    adminApi
      .listSettings()
      .catch(() => ({ data: { items: [] } }))
      .then((res) => {
        const items: any[] = res.data?.items || [];
        const flag = items.find(
          (i) => i.key === 'email_verification_enabled',
        );
        setEnabled(!!flag?.value);
      });

    api
      .get('/auth/profile')
      .then((res) => {
        setEmailVerified(!!res.data?.emailVerified);
        if (res.data?.email) setEmail(res.data.email);
      })
      .catch(() => {
        setEmailVerified(true);
      });
  }, [user]);

  if (!user || !enabled || emailVerified || dismissed) return null;

  const send = async () => {
    if (!email.includes('@')) {
      toast.error('ایمیل معتبر وارد کنید');
      return;
    }
    setSending(true);
    try {
      const res = await api.post('/auth/email/send-code', { email });
      if (res.data?.ok) {
        toast.success('لینک تأیید به ایمیل ارسال شد');
        setShowInput(false);
      } else {
        toast.error(res.data?.message || 'ارسال ناموفق');
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ارسال');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 mb-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-amber-100 font-bold text-sm mb-1">
              ایمیل خود را تأیید کنید
            </div>
            <div className="text-amber-200/70 text-xs leading-6 mb-3">
              برای تکمیل حساب کاربری و امنیت بیشتر، لینک تأیید ایمیل را
              دریافت کنید.
            </div>

            {!showInput ? (
              <button
                onClick={() => setShowInput(true)}
                className="min-h-[40px] px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-100 text-xs font-medium"
              >
                وارد کردن ایمیل
              </button>
            ) : (
              <div className="flex gap-2 flex-wrap">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  className="flex-1 min-w-[200px] bg-white/5 border border-amber-500/30 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500/60"
                />
                <button
                  onClick={send}
                  disabled={sending || !email}
                  className="min-h-[40px] px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  ارسال لینک
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-amber-300/60 hover:text-amber-300"
            aria-label="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
