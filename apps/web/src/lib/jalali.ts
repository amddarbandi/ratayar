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

// ═══════════════════════════════════════════
// Monthly calendar helpers
// ═══════════════════════════════════════════

export interface MonthDay {
  jd: number;          // 1..31
  weekday: number;     // 0=Saturday, 1=Sunday, ..., 6=Friday (Persian week)
  isFriday: boolean;
  isToday: boolean;
}

/**
 * Returns all days of a Jalali month, plus the leading empty slots so
 * that day 1 lands under the correct weekday column when the grid is
 * rendered as 7 columns starting with شنبه.
 *
 * Column order (right-to-left in UI):
 *   0 شنبه   1 یکشنبه   2 دوشنبه   3 سه‌شنبه
 *   4 چهارشنبه   5 پنجشنبه   6 جمعه
 */
export function getJalaliMonthGrid(
  jy: number,
  jm: number,
): (MonthDay | null)[] {
  // length of the current jalali month
  const monthLen = jalaaliMonthLength(jy, jm);

  // weekday of day 1
  const g1 = jalaali.toGregorian(jy, jm, 1);
  const d1 = new Date(g1.gy, g1.gm - 1, g1.gd);
  // JS: 0=Sun..6=Sat -> Persian column index (0=Sat..6=Fri)
  const jsDow = d1.getDay(); // 0 Sun, 1 Mon ... 6 Sat
  const persianCol = (jsDow + 1) % 7; // Sat=0 Sun=1 ... Fri=6

  const today = toJalali(new Date());

  const cells: (MonthDay | null)[] = [];
  for (let i = 0; i < persianCol; i++) cells.push(null);

  for (let day = 1; day <= monthLen; day++) {
    const g = jalaali.toGregorian(jy, jm, day);
    const dt = new Date(g.gy, g.gm - 1, g.gd);
    const dow = (dt.getDay() + 1) % 7; // 0=Sat .. 6=Fri
    cells.push({
      jd: day,
      weekday: dow,
      isFriday: dow === 6,
      isToday:
        today.jy === jy && today.jm === jm && today.jd === day,
    });
  }

  return cells;
}

/** Length of a Jalali month (29, 30, or 31). */
export function jalaaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  // Esfand: leap check
  return jalaali.isLeapJalaaliYear(jy) ? 30 : 29;
}
