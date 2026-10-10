'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { planApi, subscriptionApi } from '@/lib/api';
import { fmtStorageMB } from '@/lib/format';

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
      ? 'bg-white/20'
      : pct >= 100
        ? 'bg-gradient-to-r from-red-500 to-red-600'
        : pct >= 80
          ? 'bg-gradient-to-r from-amber-500 to-amber-600'
          : 'bg-gradient-to-r from-purple-500 to-cyan-500';

  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium text-white/70">{label}</span>
        <span className="text-white/60">
          {value.toLocaleString('fa-IR')}
          {unit} / {unlimited ? 'بی‌نهایت' : `${max.toLocaleString('fa-IR')}${unit}`}
          {!unlimited && (
            <span className="text-xs mr-2 text-white/50">({pct}%)</span>
          )}
        </span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
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
      <div className="p-10 text-center text-white/40" dir="rtl">
        در حال بارگذاری...
      </div>
    );

  if (error)
    return (
      <div className="p-10 text-center text-red-400" dir="rtl">
        {error}
      </div>
    );

  if (!data) return null;

  const warning = data.limits.storageWarning;
  const warningMessages = {
    ok: { text: 'وضعیت مطلوب', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text_color: 'text-emerald-200' },
    high: {
      text: '⚠️ فضای شما در حال پر شدن است (بالای ۸۰٪). به ارتقای پلن فکر کنید.',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text_color: 'text-amber-200',
    },
    full: {
      text: '🚫 فضای شما پر شده است. برای آپلود بیشتر، پلن را ارتقا دهید.',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text_color: 'text-red-200',
    },
  }[warning];

  return (
    <div className="" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">فضای ذخیره‌سازی</h1>
          <Link
            href="/dashboard/upgrade"
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg shadow-purple-500/30 hover:scale-105 transition-all"
          >
            ارتقای پلن
          </Link>
        </div>

        {/* Current plan card */}
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-white/50">پلن فعلی</div>
              <div className="text-xl font-bold">{data.plan.name}</div>
            </div>
            <div className="text-left text-sm text-white/60">
              <div>حداکثر هر فایل: {data.plan.maxUploadMB} MB</div>
              <div>
                فضای کل:{' '}
                {fmtStorageMB(data.plan.maxStorageMB)}
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
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">مصرف فضا</h2>
          <ProgressBar
            value={data.usage.storageMB}
            max={data.plan.maxStorageMB}
            label="فضای ذخیره‌سازی"
            unit=" MB"
          />
          <div className="text-sm text-white/60 mt-2">
            مصرف فعلی: <strong>{data.usage.storageMB} مگابایت</strong>
          </div>
        </div>

        {/* Counts */}
        <div className="rounded-3xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 backdrop-blur-xl p-6">
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
