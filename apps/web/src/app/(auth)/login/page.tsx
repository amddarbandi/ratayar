'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Phone, Lock, Shield, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

type Step = 'credentials' | 'twoFa';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<Step>('credentials');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [loading, setLoading] = useState(false);

  // بعد از ورود موفق (user + tokens دریافت شد)
  const completeLogin = (data: any) => {
    setAuth(data.user, data.accessToken, data.refreshToken);
    toast.success(`خوش آمدی ${data.user.fullName}! 👋`);

    const pendingInvite = localStorage.getItem('pendingInvite');
    if (pendingInvite) {
      localStorage.removeItem('pendingInvite');
      router.push(`/join/${pendingInvite}`);
    } else {
      router.push('/dashboard');
    }
  };

  // مرحله ۱: ارسال phone + password
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^09[0-9]{9}$/.test(phone)) {
      toast.error('شماره موبایل نامعتبر است');
      return;
    }
    if (!password) {
      toast.error('رمز عبور را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.login({ phone, password });

      // اگر 2FA فعال است → برو مرحله ۲
      if (data?.requires2FA === true) {
        setStep('twoFa');
        setTwoFaCode('');
        toast.info('کد ورود دو مرحله‌ای را از اپ Authenticator وارد کنید');
        return;
      }

      // ورود موفق بدون 2FA
      completeLogin(data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'شماره موبایل یا رمز عبور اشتباه است',
      );
    } finally {
      setLoading(false);
    }
  };

  // مرحله ۲: ارسال کد 2FA
  const handleTwoFaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (twoFaCode.length !== 6) {
      toast.error('کد باید ۶ رقمی باشد');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.login({
        phone,
        password,
        twoFaCode,
      });

      // اگر باز هم requires2FA برگشت (نباید اتفاق بیفتد) → خطا
      if (data?.requires2FA === true) {
        toast.error('کد پذیرفته نشد. دوباره تلاش کنید');
        return;
      }

      completeLogin(data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'کد ورود دو مرحله‌ای اشتباه است',
      );
    } finally {
      setLoading(false);
    }
  };

  // بازگشت به مرحله ۱
  const handleBack = () => {
    setStep('credentials');
    setTwoFaCode('');
    toast.info('به مرحله ورود بازگشتید');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden">
      <div className="fixed inset-0 -z-10 grid-pattern opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">راتایار</span>
          </Link>

          {step === 'credentials' ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">خوش برگشتی</h1>
              <p className="text-white/50 text-sm">وارد حساب کاربری‌ات شو</p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-3">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white/80">ورود دو مرحله‌ای</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                تایید هویت
              </h1>
              <p className="text-white/50 text-sm">
                کد ۶ رقمی از اپ Authenticator
              </p>
            </>
          )}
        </div>

        <Card>
          <CardContent className="p-5 md:p-8">
            {step === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <Input
                  label="شماره موبایل"
                  placeholder="09121234567"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone className="w-5 h-5" />}
                  dir="ltr"
                  autoFocus
                  disabled={loading}
                />

                <Input
                  label="رمز عبور"
                  placeholder="رمز عبور خود را وارد کنید"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                >
                  ورود
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </form>
            )}

            {step === 'twoFa' && (
              <form onSubmit={handleTwoFaSubmit} className="space-y-5">
                <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                  <p className="text-xs text-white/60 mb-1">
                    کد را از اپ Google Authenticator خود بخوانید
                  </p>
                  <p className="text-xs text-white/40" dir="ltr">
                    {phone.replace(/^(\d{4})\d{3}(\d{4})$/, '$1***$2')}
                  </p>
                </div>

                <Input
                  label="کد ورود دو مرحله‌ای"
                  placeholder="- - - - - -"
                  type="text"
                  inputMode="numeric"
                  value={twoFaCode}
                  onChange={(e) =>
                    setTwoFaCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  icon={<KeyRound className="w-5 h-5" />}
                  dir="ltr"
                  className="text-center text-2xl tracking-[0.5em] font-bold"
                  autoFocus
                  maxLength={6}
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={twoFaCode.length !== 6}
                  isLoading={loading}
                >
                  تایید و ورود
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="w-full text-sm text-white/50 hover:text-white transition-colors"
                >
                  بازگشت به مرحله قبل
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm">
              <span className="text-white/50">حساب نداری؟ </span>
              <Link
                href="/register"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                ثبت‌نام کن
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
