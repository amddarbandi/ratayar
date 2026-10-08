'use client';

import {
  toJalaliString,
  toJalaliShort,
  toJalaliLong,
  toJalaliDateTime,
  relativeJalali,
  relativeColor,
  daysUntil,
} from '@/lib/jalali';
import { cn } from '@/lib/utils';

type Variant = 'short' | 'string' | 'long' | 'datetime';

interface Props {
  value: string | Date | null | undefined;
  variant?: Variant;
  showRelative?: boolean;
  className?: string;
  fallback?: string;
}

export function JalaliDateDisplay({
  value,
  variant = 'string',
  showRelative = false,
  className,
  fallback = '—',
}: Props) {
  if (!value) return <span className={className}>{fallback}</span>;

  const main =
    variant === 'short'
      ? toJalaliShort(value)
      : variant === 'long'
        ? toJalaliLong(value)
        : variant === 'datetime'
          ? toJalaliDateTime(value)
          : toJalaliString(value);

  if (!showRelative) {
    return <span className={className}>{main}</span>;
  }

  const rel = relativeJalali(value);
  const color = relativeColor(value);
  const d = daysUntil(value);
  const inPast = d < 0;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span>{main}</span>
      <span className={cn('text-xs', color)}>
        ({inPast ? rel : `تا ${rel}`})
      </span>
    </span>
  );
}
