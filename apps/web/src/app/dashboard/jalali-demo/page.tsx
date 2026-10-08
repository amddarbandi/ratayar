'use client';

import { useState } from 'react';
import { JalaliDatePicker } from '@/components/common/jalali-date-picker';
import { JalaliDateDisplay } from '@/components/common/jalali-date-display';
import { todayISO, toJalaliString, relativeJalali } from '@/lib/jalali';

export default function JalaliDemoPage() {
  const [iso, setIso] = useState<string>(todayISO());

  const samples = [
    todayISO(),
    new Date(Date.now() + 86400000).toISOString(),
    new Date(Date.now() + 7 * 86400000).toISOString(),
    new Date(Date.now() - 2 * 86400000).toISOString(),
    new Date(Date.now() + 30 * 86400000).toISOString(),
    '2026-03-21T00:00:00Z', // 1 Farvardin
  ];

  return (
    <div dir="rtl" className="p-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-white mb-2">تست تقویم شمسی</h1>
      <p className="text-white/60 mb-8">
        بررسی زیرساخت تاریخ شمسی — پیکر و نمایش
      </p>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">
          انتخابگر تاریخ
        </h2>
        <JalaliDatePicker
          value={iso}
          onChange={setIso}
          label="یک تاریخ انتخاب کن"
        />
        <div className="mt-4 text-sm text-white/70">
          انتخاب شده (ISO):{' '}
          <span className="font-mono text-xs" dir="ltr">
            {iso}
          </span>
        </div>
        <div className="mt-1 text-sm text-white/70">
          نمایش شمسی: <strong>{toJalaliString(iso)}</strong>{' '}
          <span className="text-white/50">— {relativeJalali(iso)}</span>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          نمایش تاریخ‌ها (نمونه‌ها)
        </h2>
        <div className="space-y-3">
          {samples.map((s, i) => (
            <div
              key={i}
              className="flex justify-between items-center border-b border-white/5 pb-2 text-sm"
            >
              <span className="text-white/60">
                {i === 0
                  ? 'امروز'
                  : i === 1
                    ? 'فردا'
                    : i === 2
                      ? 'یک هفته بعد'
                      : i === 3
                        ? 'دو روز قبل'
                        : i === 4
                          ? 'یک ماه بعد'
                          : 'اول فروردین'}
              </span>
              <JalaliDateDisplay value={s} showRelative />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-xs text-white/40">
        پس از تأیید این صفحه، همه فرم‌ها و لیست‌ها به شمسی تبدیل می‌شوند.
      </div>
    </div>
  );
}
