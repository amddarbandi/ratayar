import Link from 'next/link';
import { LogoWordmark } from '@/components/brand/logo';
import {
  Repeat, TrendingUp, Calendar, Network, Shield, Sparkles,
} from 'lucide-react';

const tools = [
  { label: 'تبدیل',     href: '/dashboard/converters', icon: Repeat },
  { label: 'بازار',     href: '/dashboard/market',     icon: TrendingUp },
  { label: 'تقویم',     href: '/dashboard/calendar',   icon: Calendar },
  { label: 'IP',        href: '/dashboard/network',    icon: Network },
];

const productLinks = [
  { label: 'ویژگی‌ها',        href: '#features' },
  { label: 'چطور کار می‌کند', href: '#how' },
  { label: 'قیمت‌ها',          href: '#pricing' },
  { label: 'داشبورد',          href: '/dashboard' },
];

const companyLinks = [
  { label: 'درباره ما',  href: '/about' },
  { label: 'تماس',       href: '/contact' },
  { label: 'وبلاگ',      href: '/blog' },
];

const legalLinks = [
  { label: 'حریم خصوصی',   href: '/privacy' },
  { label: 'شرایط استفاده', href: '/terms' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 mt-12">
      {/* ambient glows */}
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Top: brand + tools */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4">
            <Link href="/" className="inline-block mb-4">
              <LogoWordmark />
            </Link>
            <div className="text-center md:text-right max-w-xs">
              <div className="text-white text-base font-bold mb-1">
                دستیار هوشمند زندگی
              </div>
              <div className="text-white/50 text-sm leading-7">
                مدیریت تعهدات، دارایی‌ها، اسناد و خانواده در یک اپ
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-emerald-300/80">
              <Shield className="w-3.5 h-3.5" />
              <span>داده‌های شما رمزنگاری‌شده و امن است</span>
            </div>
          </div>

          {/* Tools (mobile grid-col-1, desktop col-span-2) */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-white mb-3 text-sm">ابزارها</h3>
            <ul className="space-y-2.5">
              {tools.map((t) => (
                <li key={t.href}>
                  <Link
                    href={t.href}
                    className="group inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
                  >
                    <t.icon className="w-3.5 h-3.5 text-white/30 group-hover:text-purple-400 transition-colors" />
                    {t.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-white mb-3 text-sm">محصول</h3>
            <ul className="space-y-2.5">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-white mb-3 text-sm">شرکت</h3>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-white mb-3 text-sm">قانونی</h3>
            <ul className="space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <p className="text-white/40 text-xs md:text-sm">
            © ۱۴۰۵ راتایار — تمامی حقوق محفوظ است.
          </p>
          <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400/70" />
            <span>پلتفرم دیگری از گروه مهندسی راتا</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
