'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Crown, Upload, Loader2, Check } from 'lucide-react';
import { plansApi, paymentApi, subscriptionApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { fmtStorageMB } from '@/lib/format';
import { toast } from 'sonner';

interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string;
  priceMonthly: string;
  maxMembers: number;
  maxObligations: number;
  maxAssets: number;
  maxDocuments: number;
  maxStorageMB: number;
  maxUploadMB: number;
  isPopular?: boolean;
}

function UpgradeContent() {
  const router = useRouter();
  const params = useSearchParams();
  const preselected = params.get('plan');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentCode, setCurrentCode] = useState<string>('');
  const [selected, setSelected] = useState<Plan | null>(null);
  const [months, setMonths] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([plansApi.list(), subscriptionApi.me()])
      .then(([plansRes, subRes]) => {
        const list: Plan[] = plansRes.data;
        setPlans(list);
        setCurrentCode(subRes.data?.plan?.code || 'free');
        if (preselected) {
          const found = list.find((p) => p.code === preselected);
          if (found) setSelected(found);
        }
      })
      .catch(() => toast.error('خطا در بارگذاری اطلاعات'))
      .finally(() => setLoading(false));
  }, [preselected]);

  const fmt = (n: number) => (n === -1 ? 'بی‌نهایت' : n.toLocaleString('fa-IR'));
  const fmtPrice = (p: string) => Number(p).toLocaleString('fa-IR');
  const totalAmount = selected ? Number(selected.priceMonthly) * months : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !file) {
      toast.error('پلن و تصویر رسید الزامی است');
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('receipt', file);
      form.append('planId', selected.id);
      form.append('months', String(months));
      if (trackingCode) form.append('trackingCode', trackingCode);

      await paymentApi.create(form);
      toast.success(
        'درخواست پرداخت ثبت شد. ادمین پس از بررسی، پلن را فعال می‌کند.',
      );
      setFile(null);
      setTrackingCode('');
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || 'خطا در ارسال درخواست. دوباره تلاش کنید.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ارتقای پلن</h1>
        </div>
        <p className="text-white/50">
          پلن فعلی: <strong className="text-white/80">{currentCode}</strong>
        </p>
      </div>

      {loading && (
        <div className="text-center py-12 text-white/40">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          در حال بارگذاری...
        </div>
      )}

      {/* Plans grid — exclude free plan */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-5xl mx-auto">
          {plans
            .filter((p) => p.code !== 'free')
            .map((plan, i) => {
            const isCurrent = plan.code === currentCode;
            const isSelected = selected?.id === plan.id;
            return (
              <motion.button
                key={plan.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                type="button"
                disabled={isCurrent}
                onClick={() => setSelected(plan)}
                className={cn(
                  'text-right p-6 md:p-8 rounded-3xl border-2 transition-all backdrop-blur-xl',
                  isSelected
                    ? 'border-purple-500/60 bg-gradient-to-br from-purple-500/20 to-cyan-500/5 shadow-lg shadow-purple-500/20'
                    : isCurrent
                      ? 'border-white/10 bg-white/[0.03] opacity-60 cursor-not-allowed'
                      : 'border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] hover:border-purple-500/40',
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xl md:text-2xl text-white">
                    {plan.name}
                  </div>
                  {isSelected && (
                    <Check className="w-5 h-5 text-purple-400" />
                  )}
                  {isCurrent && (
                    <span className="text-xs md:text-sm md:text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                      فعلی
                    </span>
                  )}
                </div>
                <div className="text-base md:text-lg text-white/70 mb-4">
                  {fmtPrice(plan.priceMonthly)} تومان/ماه
                </div>
                <ul className="text-sm md:text-base text-white/60 space-y-2">
                  <li>👥 {fmt(plan.maxMembers)} کاربر</li>
                  <li>📋 {fmt(plan.maxObligations)} تعهد</li>
                  <li>📄 {fmt(plan.maxDocuments)} سند</li>
                  <li>
                    💾{' '}
                    {fmtStorageMB(plan.maxStorageMB)}
                  </li>
                </ul>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Payment form */}
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  پرداخت برای پلن «{selected.name}»
                </h2>
                <p className="text-white/50 text-sm">
                  مبلغ نهایی:{' '}
                  <strong className="text-white">
                    {totalAmount.toLocaleString('fa-IR')} تومان
                  </strong>
                </p>
              </div>

              {/* Card info panel */}
              <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-cyan-500/5 p-5 space-y-2">
                <p className="text-sm text-white/80 font-medium">
                  مبلغ را به شماره کارت زیر واریز کنید، سپس تصویر رسید را
                  آپلود نمایید:
                </p>
                <p
                  className="font-mono text-lg text-white bg-black/30 border border-white/10 rounded-xl p-3 text-center tracking-wider"
                  dir="ltr"
                >
                  6037-XXXX-XXXX-XXXX
                </p>
                <p className="text-xs text-white/40">
                  شماره کارت توسط ادمین اعلام می‌شود.
                </p>
              </div>

              {/* Months */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  مدت اشتراک
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 6, 12].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMonths(m)}
                      className={cn(
                        'p-3 rounded-xl text-sm font-medium transition-all border-2',
                        months === m
                          ? 'bg-purple-500/20 border-purple-500/50 text-white'
                          : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10',
                      )}
                    >
                      {m} ماه
                    </button>
                  ))}
                </div>
              </div>

              {/* Tracking code */}
              <Input
                label="کد پیگیری (اختیاری)"
                placeholder="شماره پیگیری بانکی"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                dir="ltr"
              />

              {/* File upload */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  تصویر رسید
                  <span className="text-white/40 text-xs mr-2">
                    (JPG / PNG / WebP / PDF — حداکثر ۵ مگابایت)
                  </span>
                </label>
                <label
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 w-full p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all',
                    file
                      ? 'border-purple-500/50 bg-purple-500/10'
                      : 'border-white/15 bg-white/[0.02] hover:border-purple-500/40 hover:bg-white/[0.05]',
                  )}
                >
                  <Upload
                    className={cn(
                      'w-6 h-6',
                      file ? 'text-purple-400' : 'text-white/40',
                    )}
                  />
                  <span className="text-sm text-white/70">
                    {file ? file.name : 'انتخاب فایل رسید'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit */}
              <Button
                type="button"
                variant="gradient"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting || !file}
                isLoading={submitting}
              >
                ارسال درخواست پرداخت
              </Button>

              <p className="text-xs text-white/40 text-center">
                پس از تأیید ادمین، پلن شما به‌طور خودکار فعال می‌شود و تیکت
                اطلاع‌رسانی برای شما ارسال خواهد شد.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {selected && selected.code === 'free' && (
        <Card>
          <CardContent className="p-8 text-center text-white/60">
            پلن رایگان نیازی به پرداخت ندارد.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense
      fallback={
        <div className="text-white/40 text-center py-12">بارگذاری...</div>
      }
    >
      <UpgradeContent />
    </Suspense>
  );
}
