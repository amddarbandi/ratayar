'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { planApi, subscriptionApi } from '@/lib/api';

interface Usage {
  plan: {
    code: string;
    name: string;
    maxDocuments: number;
    maxObligations: number;
    maxAssets: number;
    maxStorageMB: number;
    maxUploadMB: number;
  };
  usage: {
    documents: number;
    obligations: number;
    assets: number;
    storageBytes: number;
    storageMB: number;
  };
  limits: {
    storagePercent: number;
    storageWarning: 'ok' | 'high' | 'full';
  };
}

function ProgressBar({
  value,
  max,
  label,
  unit = '',
}: {
  value: number;
  max: number;
  label: string;
  unit?: string;
}) {
  const unlimited = max === -1;
  const pct = unlimited ? 0 : Math.min(100, Math.round((value / max) * 100));
  const color =
    unlimited
      ? 'bg-gray-300'
      : pct >= 100
        ? 'bg-red-500'
        : pct >= 80
          ? 'bg-yellow-500'
          : 'bg-green-500';

  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {value.toLocaleString('fa-IR')}
          {unit} / {unlimited ? 'بی‌نهایت' : `${max.toLocaleString('fa-IR')}${unit}`}
          {!unlimited && (
            <span className="text-xs mr-2 text-gray-500">({pct}%)</span>
          )}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all ${color}`}
          style={{ width: unlimited ? '5%' : `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function StoragePage() {
  const [data, setData] = useState<Usage | null>(null);
  const [planInfo, setPlanInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([planApi.usage(), subscriptionApi.me()])
      .then(([usageRes, subRes]) => {
        setData(usageRes.data);
        setPlanInfo(subRes.data);
      })
      .catch(() => setError('خطا در بارگذاری اطلاعات'))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500" dir="rtl">
        در حال بارگذاری...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-600" dir="rtl">
        {error}
      </div>
    );

  if (!data) return null;

  const warning = data.limits.storageWarning;
  const warningMessages = {
    ok: { text: 'وضعیت مطلوب', bg: 'bg-green-50', border: 'border-green-200', text_color: 'text-green-800' },
    high: {
      text: '⚠️ فضای شما در حال پر شدن است (بالای ۸۰٪). به ارتقای پلن فکر کنید.',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text_color: 'text-yellow-800',
    },
    full: {
      text: '🚫 فضای شما پر شده است. برای آپلود بیشتر، پلن را ارتقا دهید.',
      bg: 'bg-red-50',
      border: 'border-red-200',
      text_color: 'text-red-800',
    },
  }[warning];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">فضای ذخیره‌سازی</h1>
          <Link
            href="/dashboard/upgrade"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            ارتقای پلن
          </Link>
        </div>

        {/* Current plan card */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-gray-500">پلن فعلی</div>
              <div className="text-xl font-bold">{data.plan.name}</div>
            </div>
            <div className="text-left text-sm text-gray-600">
              <div>حداکثر هر فایل: {data.plan.maxUploadMB} MB</div>
              <div>
                فضای کل:{' '}
                {data.plan.maxStorageMB >= 1024
                  ? `${(data.plan.maxStorageMB / 1024).toFixed(0)} GB`
                  : `${data.plan.maxStorageMB} MB`}
              </div>
            </div>
          </div>
        </div>

        {/* Warning banner */}
        {warning !== 'ok' && (
          <div
            className={`${warningMessages.bg} ${warningMessages.border} ${warningMessages.text_color} border rounded-2xl p-4 mb-6`}
          >
            {warningMessages.text}
          </div>
        )}

        {/* Storage gauge */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">مصرف فضا</h2>
          <ProgressBar
            value={data.usage.storageMB}
            max={data.plan.maxStorageMB}
            label="فضای ذخیره‌سازی"
            unit=" MB"
          />
          <div className="text-sm text-gray-600 mt-2">
            مصرف فعلی: <strong>{data.usage.storageMB} مگابایت</strong>
          </div>
        </div>

        {/* Counts */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">تعداد منابع</h2>
          <ProgressBar
            value={data.usage.documents}
            max={data.plan.maxDocuments}
            label="📄 اسناد"
          />
          <ProgressBar
            value={data.usage.obligations}
            max={data.plan.maxObligations}
            label="📋 تعهدات"
          />
          <ProgressBar
            value={data.usage.assets}
            max={data.plan.maxAssets}
            label="🏠 دارایی‌ها"
          />
        </div>
      </div>
    </div>
  );
}
