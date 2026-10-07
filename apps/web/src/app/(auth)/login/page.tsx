'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Phone, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
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
      setAuth(data.user, data.accessToken, data.refreshToken);
      toast.success(`خوش آمدی ${data.user.fullName}! 👋`);

      // Check for pending invite
      const pendingInvite = localStorage.getItem('pendingInvite');
      if (pendingInvite) {
        localStorage.removeItem('pendingInvite');
        router.push(`/join/${pendingInvite}`);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'شماره موبایل یا رمز عبور اشتباه است');
    } finally {
      setLoading(false);
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
          <h1 className="text-2xl font-bold text-white mb-2">خوش برگشتی</h1>
          <p className="text-white/50 text-sm">
            وارد حساب کاربری‌ات شو
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-5">
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
              />

              <Input
                label="رمز عبور"
                placeholder="رمز عبور خود را وارد کنید"
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
                ورود
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </form>

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
