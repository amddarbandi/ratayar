'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, PartyPopper, Circle, Square } from 'lucide-react';
import {
  CITIES, DEFAULT_CITY, toHijriString, getEventsForJalali, isHoliday,
} from '@/lib/clock';
import {
  toJalali, toJalaliLong, toJalaliString, FA_MONTHS, FA_WEEKDAYS,
  getJalaliMonthGrid,
} from '@/lib/jalali';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// convert digits to Persian — used everywhere in this page
const fa2 = (n: number) =>
  n.toLocaleString('fa-IR', { minimumIntegerDigits: 2, useGrouping: false });

const faN = (n: number) => n.toLocaleString('fa-IR');

// ═══════════════════════════════════════════
// Analog clock — minimal, elegant
// ═══════════════════════════════════════════

function AnalogClock({
  time,
  shape,
}: {
  time: Date;
  shape: 'round' | 'square';
}) {
  const h = time.getHours() % 12;
  const m = time.getMinutes();
  const s = time.getSeconds();

  const hourAngle = h * 30 + m * 0.5;
  const minAngle = m * 6 + s * 0.1;
  const secAngle = s * 6;

  return (
    <div
      className={cn(
        'relative w-full max-w-[300px] aspect-square mx-auto',
        'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'border border-white/15 shadow-2xl shadow-purple-500/10',
        shape === 'round' ? 'rounded-full' : 'rounded-[2.5rem]',
      )}
    >
      {/* inner glow */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-purple-500/8 to-cyan-500/8 blur-xl pointer-events-none" />

      {/* 60 tick marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = i * 6;
        const isHour = i % 5 === 0;
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2"
            style={{
              width: isHour ? '2px' : '1px',
              height: isHour ? '12px' : '5px',
              background: isHour
                ? 'rgba(255,255,255,0.55)'
                : 'rgba(255,255,255,0.15)',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${shape === 'round' ? '44' : '42'}%)`,
              transformOrigin: 'center center',
              borderRadius: '2px',
            }}
          />
        );
      })}

      {/* hour hand */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: '6px',
          height: '26%',
          background: 'linear-gradient(to top, #7c3aed, #c4b5fd)',
          borderRadius: '4px',
          transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
          transformOrigin: 'bottom center',
        }}
      />

      {/* minute hand */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: '3px',
          height: '36%',
          background: 'linear-gradient(to top, #0891b2, #67e8f9)',
          borderRadius: '3px',
          transform: `translate(-50%, -100%) rotate(${minAngle}deg)`,
          transformOrigin: 'bottom center',
        }}
      />

      {/* second hand */}
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: '1.5px',
          height: '42%',
          background: '#f43f5e',
          transform: `translate(-50%, -100%) rotate(${secAngle}deg)`,
          transformOrigin: 'bottom center',
        }}
      />

      {/* center cap */}
      <div className="absolute top-1/2 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 shadow-lg shadow-purple-500/50 ring-4 ring-background z-10" />
    </div>
  );
}

// ═══════════════════════════════════════════
// Month calendar grid
// ═══════════════════════════════════════════

function MonthCalendar({ now }: { now: Date }) {
  const jalali = useMemo(() => toJalali(now), [now]);
  const cells = useMemo(
    () => getJalaliMonthGrid(jalali.jy, jalali.jm),
    [jalali.jy, jalali.jm],
  );
  const monthLabel = `${FA_MONTHS[jalali.jm - 1]} ${jalali.jy}`;

  const headers = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-center mb-4">
          <div className="text-white/50 text-xs mb-1">تقویم ماه</div>
          <div className="text-white font-bold text-xl">{monthLabel}</div>
        </div>

        {/* header row */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {headers.map((h, i) => (
            <div
              key={i}
              className={cn(
                'text-center text-[11px] font-medium py-1',
                i === 6 ? 'text-rose-400/70' : 'text-white/40',
              )}
            >
              {h}
            </div>
          ))}
        </div>

        {/* day grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell) return <div key={i} className="aspect-square" />;

            const events = getEventsForJalali(jalali.jm, cell.jd);
            const hasHolidayEvent = events.some((e) => e.holiday);
            const hasAnyEvent = events.length > 0;

            return (
              <div
                key={i}
                className={cn(
                  'aspect-square rounded-xl flex flex-col items-center justify-center relative transition',
                  cell.isToday
                    ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white font-bold shadow-lg shadow-purple-500/30'
                    : cell.isFriday || hasHolidayEvent
                      ? 'text-rose-300'
                      : 'text-white/80',
                  !cell.isToday && 'hover:bg-white/[0.05]',
                )}
              >
                <div className="text-sm">{faN(cell.jd)}</div>
                {hasAnyEvent && !cell.isToday && (
                  <div
                    className={cn(
                      'absolute bottom-1 w-1 h-1 rounded-full',
                      hasHolidayEvent ? 'bg-rose-400' : 'bg-cyan-400/70',
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════

export default function CalendarPage() {
  const [now, setNow] = useState(new Date());
  const [shape, setShape] = useState<'round' | 'square'>('round');
  const [cityKey, setCityKey] = useState(DEFAULT_CITY.key);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const city = useMemo(
    () => CITIES.find((c) => c.key === cityKey) || DEFAULT_CITY,
    [cityKey],
  );

  const jalali = useMemo(() => toJalali(now), [now]);
  const jalaliLong = useMemo(() => toJalaliLong(now), [now]);
  const jalaliNum = useMemo(() => toJalaliString(now), [now]);
  const hijriStr = useMemo(() => toHijriString(now), [now]);
  const weekday = FA_WEEKDAYS[now.getDay()];
  const events = useMemo(
    () => getEventsForJalali(jalali.jm, jalali.jd),
    [jalali.jm, jalali.jd],
  );
  const isTodayHoliday = useMemo(
    () => isHoliday(jalali.jm, jalali.jd, now),
    [jalali.jm, jalali.jd, now],
  );

  // gregorian display with Persian digits — build manually
  const gregMonths = [
    'ژانویه', 'فوریه', 'مارس', 'آپریل', 'مه', 'ژوئن',
    'ژوئیه', 'اوت', 'سپتامبر', 'اکتبر', 'نوامبر', 'دسامبر',
  ];
  const gregWeekdays = [
    'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه',
    'پنجشنبه', 'جمعه', 'شنبه',
  ];
  const gregorian = `${gregWeekdays[now.getDay()]}، ${faN(now.getDate())} ${gregMonths[now.getMonth()]} ${faN(now.getFullYear())}`;

  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  // hour label with Persian digits
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const ampm = h < 12 ? 'قبل از ظهر' : 'بعد از ظهر';

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              امروز
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            ساعت، تقویم و مناسبت‌های امروز
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <MapPin className="w-3.5 h-3.5 text-white/40 mx-1" />
            {CITIES.slice(0, 3).map((c) => (
              <button
                key={c.key}
                onClick={() => setCityKey(c.key)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs transition-all',
                  cityKey === c.key
                    ? 'bg-purple-500/20 text-white'
                    : 'text-white/50 hover:text-white',
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShape((s) => (s === 'round' ? 'square' : 'round'))}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors"
            title="تغییر شکل ساعت"
            aria-label="تغییر شکل ساعت"
          >
            {shape === 'round' ? (
              <Square className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Clock + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Clock column (2/5) */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5 md:p-6">
              <AnalogClock time={now} shape={shape} />

              {/* Digital readout */}
              <div className="text-center mt-6">
                <div className="text-white/50 text-[11px] mb-1">{weekday}</div>
                <div
                  className="text-5xl font-black text-white tabular-nums tracking-wider"
                  dir="ltr"
                >
                  {fa2(hour12)}
                  <span className="text-cyan-400 mx-1">:</span>
                  {fa2(m)}
                </div>
                <div className="text-white/40 text-xs mt-1">
                  {ampm} — {fa2(s)} ثانیه
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Month calendar column (3/5) */}
        <div className="lg:col-span-3">
          <MonthCalendar now={now} />
        </div>
      </div>

      {/* Three dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DateCard
          label="تاریخ شمسی"
          primary={jalaliLong}
          secondary={jalaliNum}
          accent="brand"
        />
        <DateCard
          label="تاریخ میلادی"
          primary={gregorian}
          accent="cyan"
        />
        <DateCard
          label="تاریخ قمری"
          primary={hijriStr}
          accent="amber"
        />
      </div>

      {/* Holiday banner */}
      {isTodayHoliday && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center gap-3">
          <PartyPopper className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <div>
            <div className="text-rose-200 font-medium text-sm">
              امروز تعطیل است
            </div>
            <div className="text-rose-300/70 text-xs">
              طبق مناسبت‌های رسمی یا جمعه
            </div>
          </div>
        </div>
      )}

      {/* Today's events */}
      {events.length > 0 ? (
        <Card>
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">
                مناسبت‌های امروز
              </h2>
            </div>
            <div className="space-y-3">
              {events.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    'rounded-2xl border p-4 flex items-center justify-between gap-3',
                    e.holiday
                      ? 'border-rose-500/30 bg-rose-500/5'
                      : 'border-white/10 bg-white/[0.03]',
                  )}
                >
                  <span
                    className={cn(
                      'font-medium text-sm',
                      e.holiday ? 'text-rose-200' : 'text-white/90',
                    )}
                  >
                    {e.title}
                  </span>
                  {e.holiday && (
                    <span className="text-[11px] px-2 py-1 rounded-full bg-rose-500/20 text-rose-200 whitespace-nowrap">
                      تعطیل رسمی
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-white/40 text-sm">
            امروز مناسبت خاصی ثبت نشده است.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════

const DATE_ACCENT = {
  brand: 'from-purple-500/20 to-cyan-500/10 border-purple-500/30',
  cyan: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
  amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
};

function DateCard({
  label,
  primary,
  secondary,
  accent,
}: {
  label: string;
  primary: string;
  secondary?: string;
  accent: keyof typeof DATE_ACCENT;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border bg-gradient-to-br backdrop-blur-xl p-4',
        DATE_ACCENT[accent],
      )}
    >
      <div className="text-[11px] text-white/50 mb-2">{label}</div>
      <div className="text-white font-bold text-sm leading-6">{primary}</div>
      {secondary && (
        <div className="text-white/40 text-xs mt-1 font-mono" dir="ltr">
          {secondary}
        </div>
      )}
    </div>
  );
}
