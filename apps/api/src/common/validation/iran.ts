// ═══════════════════════════════════════════
// Iranian validation helpers — API side
// Mirrors apps/web/src/lib/validation.ts
// ═══════════════════════════════════════════

export function toEnglishDigits(s: string): string {
  return String(s)
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function isValidIranianNationalId(input: string): boolean {
  if (!input) return false;
  const id = toEnglishDigits(input).trim();
  if (!/^\d{10}$/.test(id)) return false;
  if (/^(\d)\1{9}$/.test(id)) return false;
  const check = parseInt(id[9], 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(id[i], 10) * (10 - i);
  const r = sum % 11;
  return r < 2 ? check === r : check === 11 - r;
}

export function isValidIranianPostalCode(input: string): boolean {
  if (!input) return false;
  const code = toEnglishDigits(input).trim();
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  const check = parseInt(code[9], 10);
  const w = [2, 3, 4, 5, 6];
  let sum = 0;
  for (let i = 0; i < 5; i++) sum += parseInt(code[i], 10) * w[i];
  const r = sum % 11;
  const expected = r < 2 ? 0 : 11 - r;
  return check === expected;
}

export function isValidPersianName(input: string): boolean {
  if (!input) return false;
  const t = input.trim();
  if (t.length < 2 || t.length > 40) return false;
  return /^[\u0600-\u06FF\s\u200c]+$/.test(t);
}

export function isValidEmail(input: string): boolean {
  if (!input) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.trim());
}
