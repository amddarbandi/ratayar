// ═══════════════════════════════════════════
// Number formatting — Persian everywhere
// ═══════════════════════════════════════════

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

/** Convert every Latin digit in a string to Persian. */
export function toFa(input: string | number): string {
  return String(input).replace(/\d/g, (d) => FA_DIGITS[+d]);
}

/** Number with Persian digits + thousand separators. */
export function fmtNum(
  n: number | string | null | undefined,
  opts?: { fraction?: number; fallback?: string },
): string {
  if (n === null || n === undefined || n === '') return opts?.fallback ?? '—';
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return opts?.fallback ?? '—';
  return num.toLocaleString('fa-IR', {
    maximumFractionDigits: opts?.fraction ?? 0,
    minimumFractionDigits: 0,
  });
}

/** Percentage with Persian digits and optional sign. */
export function fmtPercent(
  n: number | null | undefined,
  opts?: { fraction?: number; sign?: boolean },
): string {
  if (n === null || n === undefined || !isFinite(n)) return '—';
  const abs = Math.abs(n).toLocaleString('fa-IR', {
    maximumFractionDigits: opts?.fraction ?? 2,
  });
  if (!opts?.sign) return `${abs}٪`;
  return `${n >= 0 ? '+' : '−'}${abs}٪`;
}

/** Compact money: ۲.۵ میلیارد / ۸۵۰ هزار / ۲ میلیون. */
export function fmtMoney(
  n: number | string | null | undefined,
  opts?: { suffix?: string },
): string {
  if (n === null || n === undefined) return '—';
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return '—';
  const suffix = opts?.suffix ? ` ${opts.suffix}` : '';
  if (Math.abs(num) >= 1_000_000_000)
    return `${(num / 1_000_000_000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} میلیارد${suffix}`;
  if (Math.abs(num) >= 1_000_000)
    return `${(num / 1_000_000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} میلیون${suffix}`;
  if (Math.abs(num) >= 1_000)
    return `${(num / 1_000).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} هزار${suffix}`;
  return `${num.toLocaleString('fa-IR')}${suffix}`;
}

/** Compact English big-number: 2.5B / 120M / 45K. Persian digits. */
export function fmtCompact(
  n: number | string | null | undefined,
): string {
  if (n === null || n === undefined) return '—';
  const num = typeof n === 'string' ? Number(n) : n;
  if (!isFinite(num)) return '—';
  if (Math.abs(num) >= 1_000_000_000)
    return `${(num / 1_000_000_000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}B`;
  if (Math.abs(num) >= 1_000_000)
    return `${(num / 1_000_000).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}M`;
  if (Math.abs(num) >= 1_000)
    return `${(num / 1_000).toLocaleString('fa-IR', { maximumFractionDigits: 0 })}K`;
  return num.toLocaleString('fa-IR');
}

/** File size in B / KB / MB / GB with Persian digits. */
export function fmtSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '—';
  if (bytes < 1024)
    return `${bytes.toLocaleString('fa-IR')} بایت`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} کیلوبایت`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / 1024 / 1024).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} مگابایت`;
  return `${(bytes / 1024 / 1024 / 1024).toLocaleString('fa-IR', { maximumFractionDigits: 2 })} گیگابایت`;
}

/** Storage: MB -> MB / GB. Persian digits, short labels. */
export function fmtStorageMB(mb: number | null | undefined): string {
  if (mb === null || mb === undefined) return '—';
  if (mb >= 1024)
    return `${(mb / 1024).toLocaleString('fa-IR', { maximumFractionDigits: 0 })} GB`;
  return `${mb.toLocaleString('fa-IR')} MB`;
}
