'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { LogoIcon } from '@/components/brand/logo';

function VerifyContent() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const [state, setState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('لینک نامعتبر است');
      return;
    }
    api
      .post('/auth/email/verify', { token })
      .then((res) => {
        if (res.data?.ok) {
          setState('ok');
          setMessage(res.data.message || 'ایمیل با موفقیت تأیید شد');
        } else {
          setState('error');
          setMessage(res.data?.message || 'تأیید ناموفق بود');
        }
      })
      .catch((e) => {
        setState('error');
        setMessage(e?.response?.data?.message || 'خطا در تأیید');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-8 text-center"
      >
        <div className="flex items-center justify-center mb-4">
          <LogoIcon size={48} />
        </div>

        {state === 'loading' && (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto my-4" />
            <div className="text-white font-bold mb-2">در حال بررسی...</div>
            <div className="text-white/50 text-sm">لطفاً صبر کنید</div>
          </>
        )}

        {state === 'ok' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <div className="text-white font-bold text-xl mb-2">
              ایمیل تأیید شد
            </div>
            <div className="text-white/60 text-sm mb-6">{message}</div>
            <Link
              href="/dashboard"
              className="inline-block min-h-[44px] px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium"
            >
              ورود به داشبورد
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
              <XCircle className="w-7 h-7 text-white" />
            </div>
            <div className="text-white font-bold text-xl mb-2">
              تأیید ناموفق
            </div>
            <div className="text-white/60 text-sm mb-6">{message}</div>
            <Link
              href="/dashboard"
              className="inline-block min-h-[44px] px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80"
            >
              بازگشت به داشبورد
            </Link>
          </>
        )}

        <div className="mt-6 pt-6 border-t border-white/10">
          <Mail className="w-4 h-4 text-white/30 mx-auto" />
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}
