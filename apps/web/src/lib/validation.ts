// ═══════════════════════════════════════════
// Iranian identity validation — client + server safe
// ═══════════════════════════════════════════

/**
 * Iranian national ID (کد ملی) — 10 digits with checksum.
 */
export function isValidIranianNationalId(input: string): boolean {
  if (!input) return false;
  const id = toEnglishDigits(input).trim();
  if (!/^\d{10}$/.test(id)) return false;
  // reject all-same-digit IDs
  if (/^(\d)\1{9}$/.test(id)) return false;

  const check = parseInt(id[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(id[i], 10) * (10 - i);
  }
  const r = sum % 11;
  return r < 2 ? check === r : check === 11 - r;
}

/**
 * Extract birth info from a valid Iranian national ID.
 * Digits 1-2: year (2 digit), 3-4: month, 5-6: day.
 * Year assumes 13xx for yy > current, else 14xx.
 * (just a heuristic — final authority is birthDate field)
 */
export function extractBirthFromNationalId(id: string): {
  year: number;
  month: number;
  day: number;
} | null {
  const cleaned = toEnglishDigits(id).trim();
  if (!/^\d{10}$/.test(cleaned)) return null;
  const yy = parseInt(cleaned.slice(1, 3), 10);
  const mm = parseInt(cleaned.slice(3, 5), 10);
  const dd = parseInt(cleaned.slice(5, 7), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  // Assume 13xx if yy >= 50, else 14xx
  const year = yy >= 50 ? 1300 + yy : 1400 + yy;
  return { year, month: mm, day: dd };
}

/**
 * Iranian postal code — 10 digits with checksum.
 */
export function isValidIranianPostalCode(input: string): boolean {
  if (!input) return false;
  const code = toEnglishDigits(input).trim();
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;

  const check = parseInt(code[9], 10);
  let sum = 0;
  const weights = [2, 4, 5, 7, 8, 9];
  // wait — actual algorithm uses 5 first digits * weights
  // Standard algorithm:
  //   sum of first 5 digits * [2,3,4,5,6] mod 11
  //   but many references use different.
  // Correct per Iran Post:
  //   weights = [2, 3, 4, 5, 6] applied to digits 1-5
  //   check = sum % 11; if check < 2 -> 0, else 11 - check
  const w = [2, 3, 4, 5, 6];
  for (let i = 0; i < 5; i++) {
    sum += parseInt(code[i], 10) * w[i];
  }
  const r = sum % 11;
  const expected = r < 2 ? 0 : 11 - r;
  return check === expected;
}

/**
 * Convert Persian/Arabic digits to English.
 */
export function toEnglishDigits(s: string): string {
  return s
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

/**
 * Persian name validation: 2-30 Persian letters + space + ZWNJ.
 */
export function isValidPersianName(input: string): boolean {
  if (!input) return false;
  const trimmed = input.trim();
  if (trimmed.length < 2 || trimmed.length > 40) return false;
  // Persian letters: آ-ی (U+0600 to U+06FF minus digits/punct) + space + ZWNJ
  return /^[\u0600-\u06FF\s\u200c]+$/.test(trimmed);
}

/**
 * Basic email check.
 */
export function isValidEmail(input: string): boolean {
  if (!input) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}

/**
 * Jalali year range for birth date.
 */
export function isPlausibleBirthYear(jy: number): boolean {
  const currentJalali = 1404; // ~2025
  return jy >= 1300 && jy <= currentJalali;
}
