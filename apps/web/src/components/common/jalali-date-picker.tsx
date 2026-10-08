'use client';

import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import DateObject from 'react-date-object';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string | Date | null | undefined;
  onChange: (iso: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function JalaliDatePicker({
  value,
  onChange,
  label,
  required,
  placeholder = 'انتخاب تاریخ',
  disabled,
  className,
}: Props) {
  const dateValue =
    value != null
      ? new DateObject({
          date: new Date(value),
          calendar: persian,
          locale: persian_fa,
        })
      : undefined;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm mb-1 text-white/70">
          {label}
          {required && <span className="text-red-400 mr-1">*</span>}
        </label>
      )}
      <div className="relative">
        <DatePicker
          value={dateValue}
          onChange={(date) => {
            if (!date || Array.isArray(date)) return;
            onChange(date.toDate().toISOString());
          }}
          calendar={persian}
          locale={persian_fa}
          calendarPosition="bottom-right"
          portal
          zIndex={9999}
          disabled={disabled}
          inputClass={cn(
            'w-full bg-white/5 border border-white/10 rounded-lg p-2 pr-9 text-white',
            'focus:outline-none focus:border-purple-500/50 transition-colors',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
          placeholder={placeholder}
          editable={false}
          arrow={false}
        />
        <CalendarIcon className="absolute top-1/2 right-2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
      </div>
    </div>
  );
}
