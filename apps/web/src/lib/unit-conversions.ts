// Unit conversion data — pure math, no dependencies.
// Each category: { key, label, emoji, color, units: [{ key, label, symbol, toBase, fromBase }] }

export interface Unit {
  key: string;
  label: string;   // Persian name
  symbol: string;  // short symbol
  // for non-temperature units, we use scale factor to base
  factor?: number;
  // for temperature, we use functions
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
}

export interface Category {
  key: string;
  label: string;      // Persian category name
  emoji: string;
  color: string;      // tailwind gradient stops
  units: Unit[];
}

export const CATEGORIES: Category[] = [
  {
    key: 'weight',
    label: 'وزن و جرم',
    emoji: '⚖️',
    color: 'from-amber-500 to-orange-500',
    units: [
      { key: 'mg', label: 'میلی‌گرم', symbol: 'mg', factor: 0.000001 },
      { key: 'g', label: 'گرم', symbol: 'g', factor: 0.001 },
      { key: 'kg', label: 'کیلوگرم', symbol: 'kg', factor: 1 },
      { key: 't', label: 'تن', symbol: 't', factor: 1000 },
      { key: 'lb', label: 'پوند', symbol: 'lb', factor: 0.45359237 },
      { key: 'oz', label: 'اونس', symbol: 'oz', factor: 0.0283495231 },
      { key: 'nakhud', label: 'نخود', symbol: 'نخود', factor: 0.0034 },
      { key: 'mesghal', label: 'مثقال', symbol: 'مثقال', factor: 0.0046875 },
    ],
  },
  {
    key: 'length',
    label: 'طول و فاصله',
    emoji: '📏',
    color: 'from-cyan-500 to-blue-500',
    units: [
      { key: 'mm', label: 'میلی‌متر', symbol: 'mm', factor: 0.001 },
      { key: 'cm', label: 'سانتی‌متر', symbol: 'cm', factor: 0.01 },
      { key: 'm', label: 'متر', symbol: 'm', factor: 1 },
      { key: 'km', label: 'کیلومتر', symbol: 'km', factor: 1000 },
      { key: 'in', label: 'اینچ', symbol: 'in', factor: 0.0254 },
      { key: 'ft', label: 'فوت', symbol: 'ft', factor: 0.3048 },
      { key: 'yd', label: 'یارد', symbol: 'yd', factor: 0.9144 },
      { key: 'mi', label: 'مایل', symbol: 'mi', factor: 1609.344 },
    ],
  },
  {
    key: 'volume',
    label: 'حجم و ظرفیت',
    emoji: '🧪',
    color: 'from-emerald-500 to-teal-500',
    units: [
      { key: 'ml', label: 'میلی‌لیتر', symbol: 'ml', factor: 0.001 },
      { key: 'cl', label: 'سانتی‌لیتر', symbol: 'cl', factor: 0.01 },
      { key: 'l', label: 'لیتر', symbol: 'L', factor: 1 },
      { key: 'm3', label: 'متر مکعب', symbol: 'm³', factor: 1000 },
      { key: 'gal', label: 'گالن آمریکایی', symbol: 'gal', factor: 3.785411784 },
      { key: 'cup', label: 'پیمانه (cup)', symbol: 'cup', factor: 0.2365882365 },
      { key: 'tsp', label: 'قاشق چای‌خوری', symbol: 'tsp', factor: 0.00492892159 },
      { key: 'tbsp', label: 'قاشق غذاخوری', symbol: 'tbsp', factor: 0.0147867648 },
    ],
  },
  {
    key: 'temperature',
    label: 'دما',
    emoji: '🌡️',
    color: 'from-red-500 to-pink-500',
    units: [
      {
        key: 'c',
        label: 'سلسیوس',
        symbol: '°C',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      {
        key: 'f',
        label: 'فارنهایت',
        symbol: '°F',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      {
        key: 'k',
        label: 'کلوین',
        symbol: 'K',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    ],
  },
  {
    key: 'area',
    label: 'مساحت',
    emoji: '🗺️',
    color: 'from-lime-500 to-green-500',
    units: [
      { key: 'mm2', label: 'میلی‌متر مربع', symbol: 'mm²', factor: 0.000001 },
      { key: 'cm2', label: 'سانتی‌متر مربع', symbol: 'cm²', factor: 0.0001 },
      { key: 'm2', label: 'متر مربع', symbol: 'm²', factor: 1 },
      { key: 'km2', label: 'کیلومتر مربع', symbol: 'km²', factor: 1000000 },
      { key: 'ha', label: 'هکتار', symbol: 'ha', factor: 10000 },
      { key: 'acre', label: 'ایکر', symbol: 'acre', factor: 4046.8564224 },
      { key: 'ft2', label: 'فوت مربع', symbol: 'ft²', factor: 0.09290304 },
      { key: 'in2', label: 'اینچ مربع', symbol: 'in²', factor: 0.00064516 },
    ],
  },
  {
    key: 'time',
    label: 'زمان',
    emoji: '⏱️',
    color: 'from-violet-500 to-purple-500',
    units: [
      { key: 'ms', label: 'میلی‌ثانیه', symbol: 'ms', factor: 0.001 },
      { key: 's', label: 'ثانیه', symbol: 's', factor: 1 },
      { key: 'min', label: 'دقیقه', symbol: 'min', factor: 60 },
      { key: 'h', label: 'ساعت', symbol: 'h', factor: 3600 },
      { key: 'd', label: 'روز', symbol: 'd', factor: 86400 },
      { key: 'w', label: 'هفته', symbol: 'w', factor: 604800 },
      { key: 'mo', label: 'ماه (30 روز)', symbol: 'mo', factor: 2592000 },
      { key: 'y', label: 'سال (365 روز)', symbol: 'y', factor: 31536000 },
    ],
  },
  {
    key: 'data',
    label: 'حجم داده',
    emoji: '💾',
    color: 'from-sky-500 to-indigo-500',
    units: [
      { key: 'b', label: 'بایت', symbol: 'B', factor: 1 },
      { key: 'kb', label: 'کیلوبایت', symbol: 'KB', factor: 1024 },
      { key: 'mb', label: 'مگابایت', symbol: 'MB', factor: 1048576 },
      { key: 'gb', label: 'گیگابایت', symbol: 'GB', factor: 1073741824 },
      { key: 'tb', label: 'ترابایت', symbol: 'TB', factor: 1099511627776 },
      { key: 'pb', label: 'پتابایت', symbol: 'PB', factor: 1125899906842624 },
    ],
  },
  {
    key: 'speed',
    label: 'سرعت',
    emoji: '🏎️',
    color: 'from-orange-500 to-red-500',
    units: [
      { key: 'mps', label: 'متر بر ثانیه', symbol: 'm/s', factor: 1 },
      { key: 'kmh', label: 'کیلومتر بر ساعت', symbol: 'km/h', factor: 0.277777778 },
      { key: 'mph', label: 'مایل بر ساعت', symbol: 'mph', factor: 0.44704 },
      { key: 'knot', label: 'گره دریایی', symbol: 'kn', factor: 0.514444444 },
      { key: 'fts', label: 'فوت بر ثانیه', symbol: 'ft/s', factor: 0.3048 },
    ],
  },
  {
    key: 'pressure',
    label: 'فشار',
    emoji: '💨',
    color: 'from-teal-500 to-cyan-500',
    units: [
      { key: 'pa', label: 'پاسکال', symbol: 'Pa', factor: 1 },
      { key: 'kpa', label: 'کیلوپاسکال', symbol: 'kPa', factor: 1000 },
      { key: 'bar', label: 'بار', symbol: 'bar', factor: 100000 },
      { key: 'psi', label: 'پی‌اس‌آی', symbol: 'psi', factor: 6894.75729317 },
      { key: 'atm', label: 'اتمسفر', symbol: 'atm', factor: 101325 },
      { key: 'mmhg', label: 'میلی‌متر جیوه', symbol: 'mmHg', factor: 133.322387415 },
    ],
  },
  {
    key: 'energy',
    label: 'انرژی',
    emoji: '⚡',
    color: 'from-yellow-500 to-amber-500',
    units: [
      { key: 'j', label: 'ژول', symbol: 'J', factor: 1 },
      { key: 'kj', label: 'کیلوژول', symbol: 'kJ', factor: 1000 },
      { key: 'cal', label: 'کالری', symbol: 'cal', factor: 4.184 },
      { key: 'kcal', label: 'کیلوکالری', symbol: 'kcal', factor: 4184 },
      { key: 'wh', label: 'وات‌ساعت', symbol: 'Wh', factor: 3600 },
      { key: 'kwh', label: 'کیلووات‌ساعت', symbol: 'kWh', factor: 3600000 },
    ],
  },
];

// Core conversion
export function convert(value: number, from: Unit, to: Unit): number {
  if (from.key === to.key) return value;

  // Temperature uses functions; everything else uses factors
  if (from.toBase && to.fromBase) {
    return to.fromBase(from.toBase(value));
  }
  const base = value * (from.factor ?? 1);
  return base / (to.factor ?? 1);
}
