import { Coordinates, CalculationMethod, PrayerTimes, SunnahTimes } from 'adhan';

// ═══════════════════════════════════════════
// Calendar / Clock — Persian + Hijri + Prayer
// ═══════════════════════════════════════════

export const CITIES = [
  { key: 'tehran',   name: 'تهران',        lat: 35.6892, lng: 51.3890, tz: 'Asia/Tehran' },
  { key: 'mashhad',  name: 'مشهد',         lat: 36.2605, lng: 59.6168, tz: 'Asia/Tehran' },
  { key: 'isfahan',  name: 'اصفهان',       lat: 32.6546, lng: 51.6680, tz: 'Asia/Tehran' },
  { key: 'shiraz',   name: 'شیراز',        lat: 29.5918, lng: 52.5837, tz: 'Asia/Tehran' },
  { key: 'tabriz',   name: 'تبریز',        lat: 38.0800, lng: 46.2919, tz: 'Asia/Tehran' },
];

export const DEFAULT_CITY = CITIES[0];

// ───────────────────────────────────────────
// Hijri date (Qamari) — via Intl
// ───────────────────────────────────────────

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
}

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربیع‌الاول', 'ربیع‌الثانی', 'جمادی‌الاول', 'جمادی‌الثانی',
  'رجب', 'شعبان', 'رمضان', 'شوال', 'ذی‌القعده', 'ذی‌الحجه',
];

export function toHijri(date: Date | string): HijriDate {
  const d = typeof date === 'string' ? new Date(date) : date;
  try {
    const fmt = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'Asia/Tehran',
    });
    const parts = fmt.formatToParts(d);
    const get = (t: string) =>
      parseInt(parts.find((p) => p.type === t)?.value || '0', 10);
    const year = get('year');
    const month = get('month');
    const day = get('day');
    return { year, month, day, monthName: HIJRI_MONTHS[month - 1] || '' };
  } catch {
    return { year: 0, month: 0, day: 0, monthName: '' };
  }
}

export function toHijriString(date: Date | string): string {
  const h = toHijri(date);
  if (!h.year) return '';
  return `${h.day} ${h.monthName} ${h.year}`;
}

// ───────────────────────────────────────────
// Prayer times (adhan)
// ───────────────────────────────────────────

export interface PrayerTimesResult {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
  midnight: Date;
}

export function getPrayerTimes(
  date: Date = new Date(),
  lat: number = DEFAULT_CITY.lat,
  lng: number = DEFAULT_CITY.lng,
): PrayerTimesResult {
  const coordinates = new Coordinates(lat, lng);
  const params = CalculationMethod.Tehran();
  const pt = new PrayerTimes(coordinates, date, params);
  const st = new SunnahTimes(pt);
  return {
    fajr: pt.fajr,
    sunrise: pt.sunrise,
    dhuhr: pt.dhuhr,
    asr: pt.asr,
    maghrib: pt.maghrib,
    isha: pt.isha,
    midnight: st.middleOfTheNight,
  };
}

export interface NextPrayer {
  name: string;
  label: string;
  at: Date;
  minutesUntil: number;
  hoursUntil: number;
  minsUntil: number;
}

export function getNextPrayer(
  times: PrayerTimesResult,
  now: Date = new Date(),
): NextPrayer | null {
  const list = [
    { name: 'fajr',    label: 'اذان صبح',  at: times.fajr },
    { name: 'sunrise', label: 'طلوع آفتاب', at: times.sunrise },
    { name: 'dhuhr',   label: 'اذان ظهر',  at: times.dhuhr },
    { name: 'asr',     label: 'اذان عصر',  at: times.asr },
    { name: 'maghrib', label: 'اذان مغرب', at: times.maghrib },
    { name: 'isha',    label: 'اذان عشا',  at: times.isha },
  ];
  const upcoming = list
    .filter((p) => p.at.getTime() > now.getTime())
    .sort((a, b) => a.at.getTime() - b.at.getTime());
  if (upcoming.length === 0) return null;
  const next = upcoming[0];
  const diffMs = next.at.getTime() - now.getTime();
  const totalMin = Math.round(diffMs / 60000);
  return {
    ...next,
    minutesUntil: totalMin,
    hoursUntil: Math.floor(totalMin / 60),
    minsUntil: totalMin % 60,
  };
}

export function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatTimeSec(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
}

// ───────────────────────────────────────────
// Iranian events (Jalali month/day)
// ───────────────────────────────────────────

export interface CalendarEvent {
  jm: number;
  jd: number;
  title: string;
  holiday: boolean;
}

export const EVENTS: CalendarEvent[] = [
  // فروردین
  { jm: 1,  jd: 1,  title: 'نوروز',                        holiday: true  },
  { jm: 1,  jd: 2,  title: 'عید نوروز',                    holiday: true  },
  { jm: 1,  jd: 3,  title: 'عید نوروز',                    holiday: true  },
  { jm: 1,  jd: 4,  title: 'عید نوروز',                    holiday: true  },
  { jm: 1,  jd: 12, title: 'روز جمهوری اسلامی',            holiday: true  },
  { jm: 1,  jd: 13, title: 'روز طبیعت (سیزده‌بدر)',       holiday: true  },
  { jm: 1,  jd: 25, title: 'بزرگداشت عطار نیشابوری',       holiday: false },
  // اردیبهشت
  { jm: 2,  jd: 10, title: 'روز ملی خلیج فارس',            holiday: false },
  { jm: 2,  jd: 25, title: 'بزرگداشت فردوسی',              holiday: false },
  // خرداد
  { jm: 3,  jd: 14, title: 'رحلت امام خمینی',              holiday: true  },
  { jm: 3,  jd: 15, title: 'قیام ۱۵ خرداد',               holiday: true  },
  // تیر
  { jm: 4,  jd: 7,  title: 'روز قوه قضاییه',               holiday: false },
  { jm: 4,  jd: 14, title: 'روز شهرداری و دهیاری',         holiday: false },
  // مرداد
  { jm: 5,  jd: 5,  title: 'بزرگداشت خیام نیشابوری',       holiday: false },
  { jm: 5,  jd: 28, title: 'سالروز کودتای ۲۸ مرداد',      holiday: false },
  // شهریور
  { jm: 6,  jd: 1,  title: 'روز پزشک (بزرگداشت ابن‌سینا)', holiday: false },
  { jm: 6,  jd: 4,  title: 'روز کارگر',                    holiday: false },
  { jm: 6,  jd: 5,  title: 'بزرگداشت شهریار',              holiday: false },
  { jm: 6,  jd: 27, title: 'روز شعر و ادب فارسی',          holiday: false },
  { jm: 6,  jd: 31, title: 'آغاز هفته دفاع مقدس',         holiday: false },
  // مهر
  { jm: 7,  jd: 13, title: 'روز نیروی انتظامی',            holiday: false },
  { jm: 7,  jd: 20, title: 'بزرگداشت حافظ',                holiday: false },
  // آبان
  { jm: 8,  jd: 10, title: 'روز کتاب و کتابخوانی',         holiday: false },
  { jm: 8,  jd: 13, title: 'روز مبارزه با استکبار جهانی',  holiday: false },
  { jm: 8,  jd: 24, title: 'روز کتاب',                     holiday: false },
  // آذر
  { jm: 9,  jd: 7,  title: 'روز نیروی دریایی',             holiday: false },
  { jm: 9,  jd: 16, title: 'روز دانشجو',                   holiday: false },
  { jm: 9,  jd: 25, title: 'روز پژوهش',                    holiday: false },
  { jm: 9,  jd: 30, title: 'روز قانون اساسی',              holiday: false },
  // دی
  { jm: 10, jd: 5,  title: 'روز خانواده و بازنشستگان',     holiday: false },
  { jm: 10, jd: 19, title: 'بزرگداشت خواجه نصیرالدین طوسی',holiday: false },
  { jm: 10, jd: 27, title: 'روز جهانی کوروش بزرگ',         holiday: false },
  // بهمن
  { jm: 11, jd: 12, title: 'بازگشت امام خمینی به ایران',   holiday: false },
  { jm: 11, jd: 19, title: 'روز نیروی هوایی',              holiday: false },
  { jm: 11, jd: 22, title: 'پیروزی انقلاب اسلامی',         holiday: true  },
  // اسفند
  { jm: 12, jd: 5,  title: 'روز مهندسی',                   holiday: false },
  { jm: 12, jd: 15, title: 'روز درختکاری',                 holiday: false },
  { jm: 12, jd: 25, title: 'بزرگداشت پروین اعتصامی',       holiday: false },
  { jm: 12, jd: 29, title: 'روز ملی شدن صنعت نفت ایران',   holiday: true  },
];

export function getEventsForJalali(jm: number, jd: number): CalendarEvent[] {
  return EVENTS.filter((e) => e.jm === jm && e.jd === jd);
}

export function isHoliday(
  jm: number,
  jd: number,
  date?: Date,
): boolean {
  if (date && date.getDay() === 5) return true; // Friday
  return EVENTS.some((e) => e.jm === jm && e.jd === jd && e.holiday);
}
