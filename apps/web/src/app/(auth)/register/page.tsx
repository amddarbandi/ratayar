'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Phone, User, Lock, Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { TermsModal } from '@/components/terms/terms-modal';
import { termsApi } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState<string>('');
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^09[0-9]{9}$/.test(phone)) {
      toast.error('شماره موبایل نامعتبر است');
      return;
    }
    if (password.length < 6) {
      toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد');
      return;
    }
    if (fullName.length < 2) {
      toast.error('نام را کامل وارد کنید');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.sendOtp(phone);
      toast.success('کد تایید ارسال شد');
      setDevCode(data.code || '');
      setStep('otp');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'خطا در ارسال کد');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('کد تایید باید ۶ رقمی باشد');
      return;
    }

    setLoading(true);
    try {
      const { data } = await authApi.register({
        phone,
        password,
        fullName,
      });
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success('خوش آمدید! 🎉');

      // Check for pending invite
      const pendingInvite = localStorage.getItem('pendingInvite');
      if (pendingInvite) {
        localStorage.removeItem('pendingInvite');
        router.push(`/join/${pendingInvite}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'خطا در ثبت‌نام');
    } finally {
      setLoading(false);
    }
  };

  const copyDevCode = () => {
    if (devCode) {
      navigator.clipboard.writeText(devCode);
      toast.success('کد کپی شد');
    }
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
          <h1 className="text-2xl font-bold text-white mb-2">
            {step === 'info' ? 'ساخت حساب جدید' : 'تایید شماره موبایل'}
          </h1>
          <p className="text-white/50 text-sm">
            {step === 'info'
              ? 'در کمتر از یک دقیقه شروع کنید'
              : 'کد ۶ رقمی ارسال شده به ' + phone}
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            {step === 'info' ? (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <Input
                  label="نام و نام خانوادگی"
                  placeholder="مثلاً: علی رضایی"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<User className="w-5 h-5" />}
                  autoFocus
                />
                <Input
                  label="شماره موبایل"
                  placeholder="09121234567"
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone className="w-5 h-5" />}
                  dir="ltr"
                />
                <Input
                  label="رمز عبور"
                  placeholder="حداقل ۶ کاراکتر"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-5 h-5" />}
                />
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                >
                  ارسال کد تایید
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-5">
                {devCode && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-amber-300 text-xs font-medium">
                        حالت توسعه
                      </span>
                      <button
                        type="button"
                        onClick={copyDevCode}
                        className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-black tracking-[0.3em] text-amber-300 font-mono" dir="ltr">
                        {devCode}
                      </div>
                      <p className="text-amber-300/70 text-xs mt-1">
                        این کد را در فیلد زیر وارد کنید
                      </p>
                    </div>
                  </div>
                )}

                <Input
                  label="کد تایید ۶ رقمی"
                  placeholder="- - - - - -"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  icon={<Check className="w-5 h-5" />}
                  dir="ltr"
                  className="text-center text-2xl tracking-[0.5em] font-bold"
                  autoFocus
                  maxLength={6}
                />

                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  isLoading={loading}
                >
                  ثبت‌نام
                  <ArrowLeft className="w-5 h-5" />
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('info')}
                  className="w-full text-sm text-white/50 hover:text-white transition-colors"
                >
                  ویرایش اطلاعات
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-white/5 text-center text-sm">
              <span className="text-white/50">حساب داری؟ </span>
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 font-medium"
              >
                وارد شو
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={() => setTermsAccepted(true)}
      />
    </div>
  );
}
