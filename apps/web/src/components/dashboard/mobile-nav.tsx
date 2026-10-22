'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { userNavFor } from '@/config/user-nav';
import { useAuthStore } from '@/stores/auth-store';

export function MobileNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  const allItems = userNavFor((user as any)?.role);
  const primary = allItems.filter((i) => i.primary);
  const rest = allItems.filter((i) => !i.primary);

  const isActive = (href: string, exact?: boolean) =>
    exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Bottom fixed nav — mobile/tablet only */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black/80 backdrop-blur-2xl border-t border-white/10"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
      >
        <div className="flex items-stretch h-16 px-1">
          {primary.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] transition-colors active:scale-95',
                  active ? 'text-purple-400' : 'text-white/50',
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 min-h-[44px] text-white/50 active:scale-95 transition-colors"
            aria-label="همه بخش‌ها"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-medium">بیشتر</span>
          </button>
        </div>
      </nav>

      {/* Sheet — all remaining items */}
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
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0f0f16] border-t border-white/10 rounded-t-3xl max-h-[85vh] overflow-y-auto"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)' }}
              dir="rtl"
            >
              <div className="sticky top-0 bg-[#0f0f16]/95 backdrop-blur-xl flex items-center justify-between px-5 py-4 border-b border-white/10 z-10">
                <h3 className="text-white font-bold">همه بخش‌ها</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-white/5 text-white/70"
                  aria-label="بستن"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 p-4 pb-8">
                {rest.map((item) => {
                  const active = isActive(item.href, item.exact);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all active:scale-95 min-h-[80px]',
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
