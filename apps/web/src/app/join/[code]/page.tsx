'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Users, Check, X, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { familyApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Status = 'checking' | 'ready' | 'accepting' | 'success' | 'error' | 'unauth';

export default function JoinPage() {
  const router = useRouter();
  const params = useParams();
  const code = params.code as string;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);

  const [status, setStatus] = useState<Status>('checking');
  const [errorMessage, setErrorMessage] = useState('');
  const [familyName, setFamilyName] = useState('');

  // ============================================
  // Check Auth
  // ============================================
  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      // Store invite code in localStorage for after login
      if (typeof window !== 'undefined') {
        localStorage.setItem('pendingInvite', code);
      }
      setStatus('unauth');
      return;
    }

    setStatus('ready');
  }, [hydrated, isAuthenticated, code]);

  // ============================================
  // Accept Invite
  // ============================================
  const handleAccept = async () => {
    setStatus('accepting');
    try {
      const { data } = await familyApi.accept(code);
      setFamilyName(data.familyName || '');
      setStatus('success');
      toast.success('به خانواده پیوستی! 🎉');
      setTimeout(() => {
        router.push('/dashboard/family');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.message || 'خطا در پذیرش دعوت');
      setStatus('error');
    }
  };

  // ============================================
  // Loading
  // ============================================
  if (!hydrated || status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 -z-10 grid-pattern opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">راتایار</span>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            {/* ============================================ */}
            {/* Unauth - need to login/register */}
            {/* ============================================ */}
            {status === 'unauth' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-float">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">
                  دعوت به خانواده
                </h1>
                <p className="text-white/60 mb-8 leading-relaxed">
                  کسی تو را به خانواده‌اش دعوت کرده. برای پذیرش،
                  اول باید وارد شوی یا ثبت‌نام کنی.
                </p>

                <div className="space-y-3">
                  <Link href="/register" className="block">
                    <Button variant="gradient" size="lg" className="w-full">
                      ثبت‌نام سریع
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/login" className="block">
                    <Button variant="default" size="lg" className="w-full">
                      ورود به حساب
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {/* ============================================ */}
            {/* Ready - show accept button */}
            {/* ============================================ */}
            {status === 'ready' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-float">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">
                  دعوت به خانواده
                </h1>
                <p className="text-white/60 mb-8 leading-relaxed">
                  روی دکمه زیر کلیک کن تا به خانواده اضافه شوی
                </p>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 mb-6">
                  <div className="text-xs text-purple-300 mb-1">کد دعوت</div>
                  <div className="text-lg font-black tracking-widest text-white font-mono" dir="ltr">
                    {code}
                  </div>
                </div>

                <Button
                  onClick={handleAccept}
                  variant="gradient"
                  size="lg"
                  className="w-full"
                >
                  <Check className="w-5 h-5" />
                  پیوستن به خانواده
                </Button>
              </>
            )}

            {/* ============================================ */}
            {/* Accepting */}
            {/* ============================================ */}
            {status === 'accepting' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-6 text-purple-400 animate-spin" />
                <h1 className="text-xl font-bold text-white mb-2">
                  در حال پیوستن...
                </h1>
                <p className="text-white/50 text-sm">لطفاً صبر کن</p>
              </>
            )}

            {/* ============================================ */}
            {/* Success */}
            {/* ============================================ */}
            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-3">
                  خوش آمدی! 🎉
                </h1>
                <p className="text-white/60 mb-6">
                  {familyName ? `به «${familyName}» پیوستی` : 'با موفقیت به خانواده پیوستی'}
                </p>
                <p className="text-white/40 text-sm">
                  در حال انتقال به صفحه خانواده...
                </p>
              </>
            )}

            {/* ============================================ */}
            {/* Error */}
            {/* ============================================ */}
            {status === 'error' && (
              <>
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <X className="w-10 h-10 text-red-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">
                  خطا در پذیرش
                </h1>
                <p className="text-white/60 mb-8 leading-relaxed">
                  {errorMessage}
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/dashboard/family')}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                  >
                    رفتن به صفحه خانواده
                  </Button>
                  <Button
                    onClick={() => router.push('/')}
                    variant="default"
                    size="lg"
                    className="w-full"
                  >
                    بازگشت به خانه
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
