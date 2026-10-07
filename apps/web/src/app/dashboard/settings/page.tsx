'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Lock, Shield, Trash2, Check, X, Loader2, Copy,
  AlertTriangle, Key, Bell, Smartphone, LogOut,
} from 'lucide-react';
import { toast } from 'sonner';
import { settingsApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const tabs = [
  { key: 'profile', label: 'پروفایل', icon: User },
  { key: 'security', label: 'امنیت', icon: Shield },
  { key: '2fa', label: 'ورود دو مرحله‌ای', icon: Key },
  { key: 'danger', label: 'منطقه خطر', icon: AlertTriangle },
];

export default function SettingsPage() {
  const [tab, setTab] = useState('profile');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">تنظیمات</h1>
        <p className="text-white/50">مدیریت حساب کاربری</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              tab === t.key
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10',
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'profile' && <ProfileTab key="profile" />}
        {tab === 'security' && <SecurityTab key="security" />}
        {tab === '2fa' && <TwoFATab key="2fa" />}
        {tab === 'danger' && <DangerTab key="danger" />}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Profile Tab
// ============================================
function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [birthDate, setBirthDate] = useState(
    user?.birthDate ? user.birthDate.split('T')[0] : ''
  );

  const updateMutation = useMutation({
    mutationFn: (data: any) => settingsApi.updateProfile(data),
    onSuccess: (res) => {
      setUser(res.data);
      toast.success('پروفایل ذخیره شد ✅');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'خطا'),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      fullName: fullName.trim() || undefined,
      birthDate: birthDate || undefined,
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">اطلاعات شخصی</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-bold text-white">
              {user?.fullName?.charAt(0) || '?'}
            </div>
            <div>
              <div className="font-bold text-white text-lg">{user?.fullName}</div>
              <div className="text-white/50 text-sm" dir="ltr">{user?.phone}</div>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="نام و نام خانوادگی"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="علی رضایی"
            />

            <Input
              label="تاریخ تولد"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              dir="ltr"
            />

            <Input
              label="شماره موبایل"
              value={user?.phone || ''}
              disabled
              dir="ltr"
              className="opacity-50"
            />

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              isLoading={updateMutation.isPending}
            >
              <Check className="w-4 h-4" />
              ذخیره تغییرات
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// Security Tab
// ============================================
function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const changeMutation = useMutation({
    mutationFn: (data: any) => settingsApi.changePassword(data),
    onSuccess: () => {
      toast.success('رمز عبور تغییر کرد 🔒');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || 'خطا در تغییر رمز'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('رمز عبور جدید حداقل ۸ کاراکتر');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('تکرار رمز مطابقت ندارد');
      return;
    }

    changeMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">تغییر رمز عبور</h2>
              <p className="text-white/50 text-xs">
                رمز عبور خود را به‌صورت دوره‌ای تغییر دهید
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="رمز فعلی"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="رمز جدید (حداقل ۸ کاراکتر)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<Key className="w-4 h-4" />}
            />

            <Input
              label="تکرار رمز جدید"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Key className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              isLoading={changeMutation.isPending}
            >
              تغییر رمز عبور
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// 2FA Tab
// ============================================
function TwoFATab() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [step, setStep] = useState<'idle' | 'setup' | 'verify' | 'backup'>('idle');
  const [setupData, setSetupData] = useState<any>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const setupMutation = useMutation({
    mutationFn: () => settingsApi.setup2FA(),
    onSuccess: (res) => {
      setSetupData(res.data);
      setStep('setup');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'خطا'),
  });

  const verifyMutation = useMutation({
    mutationFn: (code: string) => settingsApi.verify2FA(code),
    onSuccess: (res) => {
      setBackupCodes(res.data.backupCodes);
      setStep('backup');
      setUser({ ...user!, twoFaEnabled: true });
      toast.success('2FA فعال شد 🔒');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'کد اشتباه'),
  });

  const disableMutation = useMutation({
    mutationFn: (code: string) => settingsApi.disable2FA(code),
    onSuccess: () => {
      setUser({ ...user!, twoFaEnabled: false });
      toast.success('2FA غیرفعال شد');
      setStep('idle');
      setDisableCode('');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'کد اشتباه'),
  });

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast.success('کدها کپی شد');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white">
                ورود دو مرحله‌ای (2FA)
              </h2>
              <p className="text-white/50 text-xs">
                امنیت حساب خود را چند برابر کنید
              </p>
            </div>
            {user?.twoFaEnabled && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium">
                ✅ فعال
              </span>
            )}
          </div>

          {step === 'idle' && !user?.twoFaEnabled && (
            <div className="space-y-4">
              <p className="text-white/60 text-sm leading-relaxed">
                با فعال‌سازی 2FA، هر بار که وارد می‌شوی، علاوه بر رمز عبور،
                یک کد ۶ رقمی از اپ Google Authenticator هم لازم است.
              </p>
              <Button
                onClick={() => setupMutation.mutate()}
                variant="gradient"
                className="w-full"
                isLoading={setupMutation.isPending}
              >
                <Key className="w-4 h-4" />
                فعال‌سازی 2FA
              </Button>
            </div>
          )}

          {step === 'setup' && setupData && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                <p className="text-white/80 text-sm mb-3">
                  ۱. اپ Google Authenticator را نصب کن
                  <br />
                  ۲. QR زیر را اسکن کن
                </p>
                <div className="flex justify-center p-4 bg-white rounded-2xl">
                  <img src={setupData.qrCode} alt="QR" className="w-48 h-48" />
                </div>
                <div className="mt-3 p-3 rounded-xl bg-black/30">
                  <div className="text-xs text-white/40 mb-1">
                    کد دستی (اگر نمی‌تونی اسکن کنی):
                  </div>
                  <div className="font-mono text-white text-sm break-all" dir="ltr">
                    {setupData.manualEntry}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => setStep('verify')}
                variant="gradient"
                className="w-full"
              >
                بعدی — وارد کردن کد
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-white/60 text-sm">
                کد ۶ رقمی از Google Authenticator را وارد کن:
              </p>
              <Input
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="- - - - - -"
                className="text-center text-2xl tracking-[0.5em] font-bold"
                dir="ltr"
                maxLength={6}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => setStep('setup')}
                  variant="default"
                  className="flex-1"
                >
                  بازگشت
                </Button>
                <Button
                  onClick={() => verifyMutation.mutate(verifyCode)}
                  variant="gradient"
                  className="flex-1"
                  disabled={verifyCode.length !== 6}
                  isLoading={verifyMutation.isPending}
                >
                  تایید
                </Button>
              </div>
            </div>
          )}

          {step === 'backup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-amber-300 text-sm">
                    کدهای پشتیبان
                  </span>
                </div>
                <p className="text-white/70 text-xs mb-4">
                  این کدها را در جای امنی ذخیره کن. اگر گوشی‌ات را گم کردی،
                  با این کدها می‌تونی وارد شوی.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-black/30 text-center font-mono text-white text-sm"
                      dir="ltr"
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <button
                  onClick={copyBackupCodes}
                  className="mt-4 w-full text-xs px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" />
                  کپی همه کدها
                </button>
              </div>
              <Button
                onClick={() => setStep('idle')}
                variant="gradient"
                className="w-full"
              >
                ذخیره کردم، ادامه
              </Button>
            </div>
          )}

          {user?.twoFaEnabled && step === 'idle' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-emerald-300 text-sm">
                  ✅ 2FA فعال است. اکنون حساب شما محافظت بیشتری دارد.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  برای غیرفعال‌سازی، کد ۶ رقمی را وارد کن:
                </label>
                <Input
                  value={disableCode}
                  onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="- - - - - -"
                  className="text-center text-xl tracking-[0.5em] font-bold"
                  dir="ltr"
                  maxLength={6}
                />
              </div>
              <Button
                onClick={() => disableMutation.mutate(disableCode)}
                variant="default"
                className="w-full text-red-400 hover:text-red-300"
                disabled={disableCode.length !== 6}
                isLoading={disableMutation.isPending}
              >
                <X className="w-4 h-4" />
                غیرفعال‌سازی 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================
// Danger Tab
// ============================================
function DangerTab() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const deleteMutation = useMutation({
    mutationFn: (password: string) => settingsApi.deleteAccount(password),
    onSuccess: async () => {
      toast.success('حساب حذف شد');
      logout();
      router.push('/');
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'خطا'),
  });

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== 'حذف کن') {
      toast.error('برای تایید، دقیقاً بنویس: حذف کن');
      return;
    }
    if (!password) {
      toast.error('رمز عبور را وارد کن');
      return;
    }
    deleteMutation.mutate(password);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-red-500/20">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-400">منطقه خطر</h2>
              <p className="text-white/50 text-xs">
                عملیات این بخش قابل بازگشت نیست
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20">
            <h3 className="font-bold text-white mb-2">حذف کامل حساب</h3>
            <p className="text-white/60 text-sm mb-4 leading-relaxed">
              با حذف حساب، تمام تعهدات، دارایی‌ها، اسناد، خانواده و مالی
              شما حذف می‌شوند. این عملیات قابل بازگشت نیست.
            </p>

            <form onSubmit={handleDelete} className="space-y-3">
              <Input
                label="برای تایید، بنویس: حذف کن"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="حذف کن"
              />
              <Input
                label="رمز عبور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                type="submit"
                variant="default"
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
                isLoading={deleteMutation.isPending}
                disabled={confirmText !== 'حذف کن' || !password}
              >
                <Trash2 className="w-4 h-4" />
                حذف دائمی حساب
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
