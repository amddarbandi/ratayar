'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Wallet, MessageSquare, MoreHorizontal,
  X, Package, Users, FileText, HardDrive, Repeat, TrendingUp,
  Network, Crown, Settings, Bell, BarChart3, Network as NetworkIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIMARY = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/obligations', label: 'تعهدات', icon: Calendar },
  { href: '/dashboard/finance', label: 'مالی', icon: Wallet },
  { href: '/dashboard/market', label: 'بازار', icon: TrendingUp },
  { href: '__more__', label: 'بیشتر', icon: MoreHorizontal },
];

const MORE_ITEMS = [
  { href: '/dashboard/assets', label: 'دارایی‌ها', icon: Package },
  { href: '/dashboard/family', label: 'خانواده', icon: Users },
  { href: '/dashboard/documents', label: 'اسناد', icon: FileText },
  { href: '/dashboard/storage', label: 'فضای ذخیره‌سازی', icon: HardDrive },
  { href: '/dashboard/converters', label: 'تبدیل', icon: Repeat },
  { href: '/dashboard/calendar', label: 'تقویم', icon: Calendar },
  { href: '/dashboard/network', label: 'IP', icon: NetworkIcon },
  { href: '/dashboard/tickets', label: 'تیکت‌ها', icon: MessageSquare },
  { href: '/dashboard/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'اعلان‌ها', icon: Bell },
  { href: '/dashboard/upgrade', label: 'ارتقای پلن', icon: Crown },
  { href: '/dashboard/settings', label: 'تنظیمات', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Bottom bar */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black/70 backdrop-blur-2xl border-t border-white/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <div className="flex items-center justify-around h-16 px-1">
          {PRIMARY.map((item) => {
            if (item.href === '__more__') {
              return (
                <button
                  key="more"
                  onClick={() => setMoreOpen(true)}
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-white/50 active:scale-95 transition-transform"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </button>
              );
            }
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors active:scale-95',
                  active ? 'text-purple-400' : 'text-white/50',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[11px] font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 w-8 h-0.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Spacer so content is not hidden under the bar */}
      <div className="lg:hidden h-16" aria-hidden />

      {/* More sheet */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMoreOpen(false)}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0f0f16] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
            >
              <div className="sticky top-0 bg-[#0f0f16]/95 backdrop-blur-xl z-10 flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h3 className="text-white font-bold">همه بخش‌ها</h3>
                <button
                  onClick={() => setMoreOpen(false)}
                  className="p-2 rounded-xl bg-white/5 text-white/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 p-4 pb-8">
                {MORE_ITEMS.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95',
                        active
                          ? 'bg-purple-500/20 border-purple-500/40 text-white'
                          : 'bg-white/5 border-white/10 text-white/60',
                      )}
                    >
                      <item.icon
                        className={cn(
                          'w-5 h-5',
                          active ? 'text-purple-400' : '',
                        )}
                      />
                      <span className="text-xs font-medium text-center">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
