'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Clock, MapPin, Sun, Moon, Sunrise, Sunset, Star, PartyPopper,
  Circle, Square,
} from 'lucide-react';
import {
  CITIES, DEFAULT_CITY, getPrayerTimes, getNextPrayer, formatTime,
  formatTimeSec, toHijri, toHijriString, getEventsForJalali, isHoliday,
} from '@/lib/clock';
import {
  toJalali, toJalaliLong, FA_WEEKDAYS, FA_MONTHS,
} from '@/lib/jalali';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════
// Analog clock — square or round
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

  // 12 hour markers
  const markers = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div
      className={cn(
        'relative w-full max-w-[320px] aspect-square mx-auto',
        'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        'border-2 border-white/20 shadow-2xl shadow-purple-500/10',
        shape === 'round' ? 'rounded-full' : 'rounded-[2.5rem]',
      )}
    >
      {/* glow */}
      <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-purple-500/10 to-cyan-500/10 blur-xl" />

      {/* hour numbers */}
      {markers.map((i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const radius = 42;
        const x = 50 + radius * Math.cos(angle);
        const y = 50 + radius * Math.sin(angle);
        const num = i === 0 ? 12 : i;
        return (
          <div
            key={i}
            className="absolute text-white/70 font-bold text-sm"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {num}
          </div>
        );
      })}

      {/* tick marks */}
      {Array.from({ length: 60 }).map((_, i) => {
        const angle = i * 6;
        const isHour = i % 5 === 0;
        return (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 origin-bottom"
            style={{
              width: isHour ? '2px' : '1px',
              height: isHour ? '14px' : '6px',
              background: isHour ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)',
              transform: `translate(-50%, -100%) rotate(${angle}deg) translateY(-46%)`,
              transformOrigin: 'bottom center',
            }}
          />
        );
      })}

      {/* hour hand */}
      <div
        className="absolute top-1/2 left-1/2 origin-bottom"
        style={{
          width: '5px',
          height: '24%',
          background: 'linear-gradient(to top, #a855f7, #c4b5fd)',
          borderRadius: '3px',
          transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
          transformOrigin: 'bottom center',
        }}
      />

      {/* minute hand */}
      <div
        className="absolute top-1/2 left-1/2 origin-bottom"
        style={{
          width: '3px',
          height: '34%',
          background: 'linear-gradient(to top, #06b6d4, #67e8f9)',
          borderRadius: '2px',
          transform: `translate(-50%, -100%) rotate(${minAngle}deg)`,
          transformOrigin: 'bottom center',
        }}
      />

      {/* second hand */}
      <div
        className="absolute top-1/2 left-1/2 origin-bottom"
        style={{
          width: '1.5px',
          height: '40%',
          background: '#f43f5e',
          transform: `translate(-50%, -100%) rotate(${secAngle}deg)`,
          transformOrigin: 'bottom center',
        }}
      />

      {/* center dot */}
      <div className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 shadow-lg shadow-purple-500/50 z-10" />
    </div>
  );
}

// ═══════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════

export default function CalendarPage() {
  const [now, setNow] = useState(new Date());
  const [shape, setShape] = useState<'round' | 'square'>('round');
  const [cityKey, setCityKey] = useState(DEFAULT_CITY.key);

  // tick every second
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

  const prayerTimes = useMemo(
    () => getPrayerTimes(now, city.lat, city.lng),
    [now, city],
  );
  const nextPrayer = useMemo(
    () => getNextPrayer(prayerTimes, now),
    [prayerTimes, now],
  );

  const gregorian = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">
              امروز چه خبره؟
            </h1>
          </div>
          <p className="text-white/50">
            ساعت، تاریخ، مناسبت‌ها و اوقات شرعی
          </p>
        </div>

        {/* City + shape toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <MapPin className="w-4 h-4 text-white/40 mr-1" />
            {CITIES.map((c) => (
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
          >
            {shape === 'round' ? (
              <Square className="w-4 h-4" />
            ) : (
              <Circle className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Top: clock + dates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clock */}
        <Card>
          <CardContent className="p-8">
            <AnalogClock time={now} shape={shape} />
            <motion.div
              key={now.getSeconds()}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-center mt-6"
            >
              <div
                className="text-5xl font-black text-white tracking-wider tabular-nums"
                dir="ltr"
              >
                {formatTimeSec(now)}
              </div>
              <div className="text-white/50 text-sm mt-2">{weekday}</div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Dates card */}
        <Card>
          <CardContent className="p-8 space-y-6">
            {/* Jalali */}
            <div>
              <div className="text-xs text-white/40 mb-1">تاریخ شمسی</div>
              <div className="text-3xl font-bold text-white">
                {jalaliLong}
              </div>
              <div className="text-white/60 text-sm mt-1 font-mono" dir="ltr">
                {jalali.jy}/{String(jalali.jm).padStart(2, '0')}/{String(jalali.jd).padStart(2, '0')}
              </div>
            </div>

            {/* Gregorian */}
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs text-white/40 mb-1">
                تاریخ میلادی (Gregorian)
              </div>
              <div className="text-white/80">{gregorian}</div>
            </div>

            {/* Hijri */}
            <div className="pt-4 border-t border-white/10">
              <div className="text-xs text-white/40 mb-1">
                تاریخ قمری (Hijri)
              </div>
              <div className="text-white/80">{hijriStr}</div>
            </div>

            {/* Holiday badge */}
            {isTodayHoliday && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-red-400" />
                <span className="text-red-200 text-sm font-medium">
                  امروز تعطیل است
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next prayer */}
      {nextPrayer && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs text-white/50">اذان بعدی</div>
                  <div className="text-white font-bold text-lg">
                    {nextPrayer.label}
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-6">
                <div>
                  <div className="text-3xl font-black text-white" dir="ltr">
                    {formatTime(nextPrayer.at)}
                  </div>
                </div>
                <div className="text-white/60 text-sm">
                  {nextPrayer.hoursUntil > 0 && (
                    <span>{nextPrayer.hoursUntil} ساعت </span>
                  )}
                  {nextPrayer.minsUntil} دقیقه دیگر
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prayer times grid */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sun className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">اوقات شرعی</h2>
            <span className="text-xs text-white/40 mr-2">— {city.name}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <PrayerCell label="اذان صبح" time={formatTime(prayerTimes.fajr)} icon={Sunrise} />
            <PrayerCell label="طلوع آفتاب" time={formatTime(prayerTimes.sunrise)} icon={Sun} />
            <PrayerCell label="اذان ظهر" time={formatTime(prayerTimes.dhuhr)} icon={Sun} />
            <PrayerCell label="اذان عصر" time={formatTime(prayerTimes.asr)} icon={Sun} />
            <PrayerCell label="اذان مغرب" time={formatTime(prayerTimes.maghrib)} icon={Sunset} />
            <PrayerCell label="اذان عشا" time={formatTime(prayerTimes.isha)} icon={Moon} />
          </div>
        </CardContent>
      </Card>

      {/* Today's events */}
      {events.length > 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-400" />
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
                    'rounded-2xl border p-4 flex items-center justify-between',
                    e.holiday
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-white/10 bg-white/[0.03]',
                  )}
                >
                  <span
                    className={cn(
                      'font-medium',
                      e.holiday ? 'text-red-200' : 'text-white/90',
                    )}
                  >
                    {e.title}
                  </span>
                  {e.holiday && (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-200">
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
          <CardContent className="p-8 text-center text-white/40">
            امروز مناسبت خاصی ثبت نشده است.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PrayerCell({
  label,
  time,
  icon: Icon,
}: {
  label: string;
  time: string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <Icon className="w-5 h-5 text-amber-400 mx-auto mb-2" />
      <div className="text-xs text-white/50 mb-1">{label}</div>
      <div className="text-white font-bold text-lg font-mono" dir="ltr">
        {time}
      </div>
    </div>
  );
}
