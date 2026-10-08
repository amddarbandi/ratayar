'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { plansApi, paymentApi, subscriptionApi } from '@/lib/api';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      .catch(() => setError('خطا در بارگذاری اطلاعات'));
  }, [preselected]);

  const fmt = (n: number) => (n === -1 ? 'بی‌نهایت' : n.toLocaleString('fa-IR'));
  const fmtPrice = (p: string) => Number(p).toLocaleString('fa-IR');
  const totalAmount = selected ? Number(selected.priceMonthly) * months : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selected || !file) {
      setError('پلن و تصویر رسید الزامی است');
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
      setSuccess(
        'درخواست پرداخت شما ثبت شد. ادمین پس از بررسی، پلن را فعال می‌کند.',
      );
      setFile(null);
      setTrackingCode('');
    } catch (e: any) {
      setError(
        e?.response?.data?.message || 'خطا در ارسال درخواست. دوباره تلاش کنید.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4" dir="rtl">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">ارتقای پلن</h1>
        <p className="text-gray-600 mb-8">
          پلن فعلی شما: <strong>{currentCode}</strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {plans.map((plan) => {
            const isCurrent = plan.code === currentCode;
            const isSelected = selected?.id === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                disabled={isCurrent}
                onClick={() => setSelected(plan)}
                className={`text-right p-5 rounded-2xl border-2 transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isCurrent
                      ? 'border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="font-bold text-lg mb-1">{plan.name}</div>
                <div className="text-sm text-gray-600 mb-2">
                  {fmtPrice(plan.priceMonthly)} تومان/ماه
                </div>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>👥 {fmt(plan.maxMembers)} کاربر</li>
                  <li>📋 {fmt(plan.maxObligations)} تعهد</li>
                  <li>📄 {fmt(plan.maxDocuments)} سند</li>
                  <li>
                    💾{' '}
                    {plan.maxStorageMB >= 1024
                      ? `${(plan.maxStorageMB / 1024).toFixed(0)} GB`
                      : `${plan.maxStorageMB} MB`}
                  </li>
                </ul>
                {isCurrent && (
                  <div className="mt-2 text-xs text-gray-700 font-bold">
                    پلن فعلی
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selected && !selected.code.match(/^free$/) && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow p-6 max-w-2xl mx-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              پرداخت برای پلن «{selected.name}»
            </h2>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
              <p className="font-bold mb-2">اطلاعات پرداخت:</p>
              <p>
                مبلغ نهایی:{' '}
                <strong>{totalAmount.toLocaleString('fa-IR')} تومان</strong>
              </p>
              <p className="mt-2 text-gray-700">
                لطفاً مبلغ را به شماره کارت زیر واریز کنید و سپس تصویر رسید را
                آپلود نمایید:
              </p>
              <p className="font-mono text-lg mt-2 bg-white border rounded p-2 text-center">
                6037-XXXX-XXXX-XXXX
              </p>
              <p className="text-gray-500 mt-1 text-xs">
                (شماره کارت از طرف ادمین اعلام می‌شود)
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                مدت اشتراک (ماه)
              </label>
              <select
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full border rounded-lg p-2"
              >
                {[1, 2, 3, 6, 12].map((m) => (
                  <option key={m} value={m}>
                    {m} ماه
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                کد پیگیری (اختیاری)
              </label>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full border rounded-lg p-2"
                placeholder="شماره پیگیری بانکی"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                تصویر رسید (JPG/PNG/WebP/PDF — حداکثر ۵MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4 text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !file}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-bold"
            >
              {submitting ? 'در حال ارسال...' : 'ارسال درخواست پرداخت'}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              پس از تأیید ادمین، پلن شما به‌طور خودکار فعال می‌شود.
            </p>
          </form>
        )}

        {selected?.code === 'free' && (
          <div className="text-center text-gray-500">
            پلن رایگان نیازی به پرداخت ندارد.
          </div>
        )}
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="p-10">در حال بارگذاری...</div>}>
      <UpgradeContent />
    </Suspense>
  );
}
