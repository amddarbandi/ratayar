'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, ShieldCheck, Loader2, CheckCircle2, XCircle, Send, Save,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  fromName: string;
}

const DEFAULT_SMTP: SmtpConfig = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  from: '',
  fromName: 'راتایار',
};

export function EmailSettings() {
  const [enabled, setEnabled] = useState(false);
  const [smtp, setSmtp] = useState<SmtpConfig>(DEFAULT_SMTP);
  const [loading, setLoading] = useState(true);
  const [savingFlag, setSavingFlag] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [verifyResult, setVerifyResult] = useState<null | { ok: boolean; error?: string }>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listSettings();
      const items: any[] = res.data.items || [];
      const flag = items.find((i) => i.key === 'email_verification_enabled');
      const cfg = items.find((i) => i.key === 'smtp_config');
      if (flag) setEnabled(!!flag.value);
      if (cfg) setSmtp({ ...DEFAULT_SMTP, ...(cfg.value || {}) });
    } catch {
      toast.error('خطا در بارگذاری تنظیمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleEnabled = async () => {
    const next = !enabled;
    setSavingFlag(true);
    try {
      await adminApi.upsertSetting('email_verification_enabled', {
        value: next,
        description: 'اجرای تأیید ایمیل برای کاربران (L2)',
        category: 'security',
      });
      setEnabled(next);
      toast.success(next ? 'تأیید ایمیل فعال شد' : 'تأیید ایمیل غیرفعال شد');
    } catch {
      toast.error('خطا در ذخیره');
    } finally {
      setSavingFlag(false);
    }
  };

  const saveSmtp = async () => {
    setSavingSmtp(true);
    try {
      await adminApi.upsertSetting('smtp_config', {
        value: smtp,
        description: 'تنظیمات SMTP برای ارسال ایمیل',
        category: 'security',
      });
      toast.success('تنظیمات SMTP ذخیره شد');
    } catch {
      toast.error('خطا در ذخیره');
    } finally {
      setSavingSmtp(false);
    }
  };

  const doVerify = async () => {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await adminApi.verifySmtp();
      setVerifyResult(res.data);
      if (res.data.ok) toast.success('اتصال SMTP موفق بود');
      else toast.error('اتصال SMTP ناموفق');
    } catch (e: any) {
      const error = e?.response?.data?.error || 'خطا در تست اتصال';
      setVerifyResult({ ok: false, error });
      toast.error(error);
    } finally {
      setVerifying(false);
    }
  };

  const sendTest = async () => {
    if (!testTo.includes('@')) {
      toast.error('ایمیل معتبر وارد کنید');
      return;
    }
    setSendingTest(true);
    try {
      await adminApi.testSmtpEmail(testTo);
      toast.success('ایمیل تست ارسال شد');
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'ارسال ناموفق');
    } finally {
      setSendingTest(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Card 1: master toggle */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-white font-bold mb-1">
                  تأیید ایمیل کاربران (L2)
                </div>
                <div className="text-white/50 text-xs leading-6">
                  وقتی فعال باشد، پس از ورود کاربر به پلتفرم از او خواسته
                  می‌شود ایمیل خود را تأیید کند. لینک تأیید تا ۲۴ ساعت معتبر است.
                </div>
              </div>
            </div>
            <button
              onClick={toggleEnabled}
              disabled={savingFlag}
              className={cn(
                'relative min-h-[44px] px-4 rounded-xl border text-sm font-medium flex items-center gap-2 disabled:opacity-50',
                enabled
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                  : 'bg-white/5 border-white/10 text-white/60',
              )}
            >
              {savingFlag ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : enabled ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {enabled ? 'فعال' : 'غیرفعال'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: SMTP config */}
      <Card>
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-bold">تنظیمات SMTP</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Host"
              value={smtp.host}
              onChange={(v) => setSmtp({ ...smtp, host: v })}
              placeholder="smtp.gmail.com"
              dir="ltr"
            />
            <Field
              label="Port"
              value={String(smtp.port)}
              onChange={(v) => setSmtp({ ...smtp, port: parseInt(v, 10) || 0 })}
              placeholder="587"
              dir="ltr"
            />
            <Field
              label="User"
              value={smtp.user}
              onChange={(v) => setSmtp({ ...smtp, user: v })}
              placeholder="you@example.com"
              dir="ltr"
            />
            <Field
              label="Password"
              value={smtp.pass}
              onChange={(v) => setSmtp({ ...smtp, pass: v })}
              placeholder="••••••••"
              type="password"
              dir="ltr"
            />
            <Field
              label="From email"
              value={smtp.from}
              onChange={(v) => setSmtp({ ...smtp, from: v })}
              placeholder="noreply@ratayar.ir"
              dir="ltr"
            />
            <Field
              label="From name"
              value={smtp.fromName}
              onChange={(v) => setSmtp({ ...smtp, fromName: v })}
              placeholder="راتایار"
            />
            <div className="flex items-center gap-2 md:col-span-2 min-h-[44px]">
              <input
                type="checkbox"
                id="smtp-secure"
                checked={smtp.secure}
                onChange={(e) => setSmtp({ ...smtp, secure: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="smtp-secure" className="text-sm text-white/80">
                اتصال امن (SSL/TLS) — برای پورت ۴۶۵ فعال کنید
              </label>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={saveSmtp}
              disabled={savingSmtp}
              className="min-h-[44px] px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {savingSmtp ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              ذخیره
            </button>
            <button
              onClick={doVerify}
              disabled={verifying}
              className="min-h-[44px] px-5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:text-white text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {verifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              تست اتصال
            </button>
          </div>

          {verifyResult && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-xl border p-3 text-sm',
                verifyResult.ok
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-200',
              )}
            >
              {verifyResult.ok
                ? '✅ اتصال SMTP موفق بود'
                : `❌ ${verifyResult.error || 'اتصال ناموفق'}`}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Card 3: test email */}
      <Card>
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-amber-400" />
            <h3 className="text-white font-bold">ارسال ایمیل تست</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              type="email"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
              placeholder="you@example.com"
              dir="ltr"
              className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-500/50"
            />
            <button
              onClick={sendTest}
              disabled={sendingTest || !testTo}
              className="min-h-[44px] px-5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {sendingTest ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              ارسال
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  dir?: 'ltr' | 'rtl';
}) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50"
      />
    </div>
  );
}
