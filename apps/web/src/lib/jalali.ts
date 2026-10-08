import jalaali from 'jalaali-js';

// ═══════════════════════════════════════════
// Persian (Jalali) date helpers — no external date objects.
// ISO is used for storage/API; Jalali is display-only.
// ═══════════════════════════════════════════

export const FA_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

// JS getDay(): 0=Sunday ... 6=Saturday
export const FA_WEEKDAYS = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه',
];

export const FA_WEEKDAYS_SHORT = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];

function toDate(d: Date | string): Date {
  return d instanceof Date ? d : new Date(d);
}

export function toJalali(date: Date | string): { jy: number; jm: number; jd: number } {
  const dt = toDate(date);
  return jalaali.toJalaali(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

export function fromJalali(jy: number, jm: number, jd: number): Date {
  const g = jalaali.toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd);
}

// ۱۴۰۵/۰۷/۱۶
export function toJalaliString(date: Date | string): string {
  const { jy, jm, jd } = toJalali(date);
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

// ۱۶ مهر ۱۴۰۵
export function toJalaliShort(date: Date | string): string {
  const { jy, jm, jd } = toJalali(date);
  return `${jd} ${FA_MONTHS[jm - 1]} ${jy}`;
}

// چهارشنبه ۱۶ مهر ۱۴۰۵
export function toJalaliLong(date: Date | string): string {
  const dt = toDate(date);
  const { jy, jm, jd } = toJalali(dt);
  return `${FA_WEEKDAYS[dt.getDay()]} ${jd} ${FA_MONTHS[jm - 1]} ${jy}`;
}

// ۱۴۰۵/۰۷/۱۶ - 14:30
export function toJalaliDateTime(date: Date | string): string {
  const dt = toDate(date);
  const time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  return `${toJalaliString(dt)} - ${time}`;
}

// Number of full days between today (Tehran) and target.
// Both normalized to 00:00.
export function daysUntil(target: Date | string): number {
  const t = toDate(target);
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const b = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

// "امروز" / "فردا" / "۳ روز دیگر" / "۲ روز پیش"
export function relativeJalali(date: Date | string): string {
  const diff = daysUntil(date);
  if (diff === 0) return 'امروز';
  if (diff === 1) return 'فردا';
  if (diff === -1) return 'دیروز';
  if (diff > 1) return `${diff} روز دیگر`;
  return `${-diff} روز پیش`;
}

// Tailwind color class based on urgency
export function relativeColor(date: Date | string): string {
  const diff = daysUntil(date);
  if (diff < 0) return 'text-red-400';
  if (diff === 0) return 'text-red-300';
  if (diff <= 3) return 'text-yellow-400';
  if (diff <= 7) return 'text-orange-400';
  return 'text-white/60';
}

// Accept "۱۴۰۵/۰۷/۱۶" or "1405/07/16" and return ISO date string.
export function parseJalaliString(input: string): string | null {
  const cleaned = input
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .trim();
  const m = cleaned.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (!m) return null;
  const [, y, mo, d] = m.map(Number) as unknown as number[];
  const dt = fromJalali(y, mo, d);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

// Today in ISO (Tehran-aligned)
export function todayISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}
