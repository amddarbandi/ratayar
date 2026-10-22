'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Calendar, BarChart3, Package, CreditCard,
  MessageSquare, FileText, ListChecks, Bell, Megaphone, LineChart,
  ShieldAlert, KeyRound, Activity, Settings, Flag, Database, Menu, X,
  ChevronLeft, SlidersHorizontal,
} from 'lucide-react';
import { LogoIcon } from '@/components/brand/logo';
import { cn } from '@/lib/utils';

interface Item {
  href: string;
  label: string;
  icon: any;
  group?: string;
}

// ── Single source of truth for admin navigation ──
// The desktop sidebar and this mobile drawer must use the same list.
export const ADMIN_NAV_ITEMS: Item[] = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard, group: 'اصلی' },
  { href: '/admin/users', label: 'کاربران', icon: Users, group: 'اصلی' },
  { href: '/admin/subscriptions', label: 'اشتراک‌ها', icon: Calendar, group: 'کسب‌وکار' },
  { href: '/admin/revenue', label: 'درآمد', icon: BarChart3, group: 'کسب‌وکار' },
  { href: '/admin/plans', label: 'پلن‌ها', icon: Package, group: 'کسب‌وکار' },
  { href: '/admin/plans/limits', label: 'محدودیت پلن‌ها', icon: SlidersHorizontal, group: 'کسب‌وکار' },
  { href: '/admin/payments', label: 'پرداخت‌ها', icon: CreditCard, group: 'کسب‌وکار' },
  { href: '/admin/tickets', label: 'تیکت‌ها', icon: MessageSquare, group: 'پشتیبانی' },
  { href: '/admin/documents', label: 'اسناد', icon: FileText, group: 'محتوا' },
  { href: '/admin/obligations', label: 'تعهدات', icon: ListChecks, group: 'محتوا' },
  { href: '/admin/notifications', label: 'اعلان‌ها', icon: Bell, group: 'محتوا' },
  { href: '/admin/broadcast', label: 'ارسال گروهی', icon: Megaphone, group: 'پشتیبانی' },
  { href: '/admin/analytics', label: 'آنالیتیکس', icon: LineChart, group: 'گزارش' },
  { href: '/admin/abuse', label: 'کنترل دسترسی', icon: ShieldAlert, group: 'سیستم' },
  { href: '/admin/api-keys', label: 'کلیدهای API', icon: KeyRound, group: 'سیستم' },
  { href: '/admin/audit-log', label: 'لاگ اقدامات', icon: Activity, group: 'سیستم' },
  { href: '/admin/settings', label: 'تنظیمات پلتفرم', icon: Settings, group: 'سیستم' },
  { href: '/admin/flags', label: 'فلگ‌های ویژگی', icon: Flag, group: 'سیستم' },
  { href: '/admin/backup', label: 'بکاپ', icon: Database, group: 'سیستم' },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/admin' && pathname.startsWith(href));

  const grouped = ADMIN_NAV_ITEMS.reduce<Record<string, Item[]>>(
    (acc, it) => {
      const g = it.group || 'سایر';
      if (!acc[g]) acc[g] = [];
      acc[g].push(it);
      return acc;
    },
    {},
  );

  return (
    <>
      {/* Top bar — only on lg:hidden */}
      <div className="lg:hidden sticky top-0 z-40 border-b border-white/10 bg-black/60 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setOpen(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/80"
            aria-label="باز کردن منوی مدیریت"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <LogoIcon size={28} />
            <span className="text-white font-bold text-sm">پنل مدیریت</span>
          </Link>
          <Link
            href="/dashboard"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60"
            aria-label="بازگشت به داشبورد"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-[#0f0f16] border-l border-white/10 z-50 flex flex-col"
              dir="rtl"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <LogoIcon size={32} />
                  <div>
                    <div className="text-white font-bold text-sm">پنل مدیریت</div>
                    <div className="text-white/40 text-[11px]">راتایار</div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Grouped items */}
              <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                {Object.entries(grouped).map(([group, list]) => (
                  <div key={group}>
                    <div className="text-[10px] text-white/30 px-3 mb-1">
                      {group}
                    </div>
                    <div className="space-y-1">
                      {list.map((item) => {
                        const active = isActive(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex items-center gap-3 px-3 py-3 rounded-xl min-h-[44px] transition-colors',
                              active
                                ? 'bg-gradient-to-l from-red-500/20 to-transparent text-white'
                                : 'text-white/70 hover:bg-white/5',
                            )}
                          >
                            <item.icon
                              className={cn(
                                'w-5 h-5 flex-shrink-0',
                                active ? 'text-red-400' : 'text-white/40',
                              )}
                            />
                            <span className="font-medium text-sm">
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Drawer footer */}
              <div className="p-4 border-t border-white/10">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  بازگشت به داشبورد
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
