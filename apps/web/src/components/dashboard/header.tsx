'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Bell, Menu, Sparkles, X, Search, Command, LogOut,
  LayoutDashboard, Calendar, Package, Wallet, Users, FileText,
  Settings, Network,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { authApi, notificationsApi } from '@/lib/api';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/dashboard/obligations', label: 'تعهدات', icon: Calendar },
  { href: '/dashboard/assets', label: 'دارایی‌ها', icon: Package },
  { href: '/dashboard/finance', label: 'مالی', icon: Wallet },
  { href: '/dashboard/family', label: 'خانواده', icon: Users },
  { href: '/dashboard/family-tree', label: 'شجره‌نامه', icon: Network },
  { href: '/dashboard/notifications', label: 'اعلان‌ها', icon: Bell },
  { href: '/dashboard/documents', label: 'اسناد', icon: FileText },
  { href: '/dashboard/settings', label: 'تنظیمات', icon: Settings },
];

export function DashboardHeader({
  onSearchClick,
}: {
  onSearchClick?: () => void;
}) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {}
    logout();
    toast.success('خروج موفق');
    router.push('/');
  };

  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac');

  return (
    <>
      <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
        <div className="flex items-center justify-between gap-3 px-4 lg:px-8 h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 text-white/80 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Mobile logo */}
          <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold gradient-text">راتایار</span>
          </Link>

          {/* Search button (desktop) */}
          <button
            onClick={onSearchClick}
            className="hidden lg:flex items-center gap-3 flex-1 max-w-md px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all text-right group"
          >
            <Search className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
            <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors flex-1">
              جستجو در همه چیز...
            </span>
            <kbd className="hidden md:flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/10 text-white/50 text-[10px]">
              {isMac ? '⌘' : 'Ctrl'} + K
            </kbd>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search button (mobile) */}
            <button
              onClick={onSearchClick}
              className="lg:hidden p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            <NotificationBell />

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.charAt(0) || '?'}
              </div>
              <span className="text-sm text-white/80 max-w-[100px] truncate">
                {user?.fullName}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#0A0A0F] border-l border-white/10 p-4 lg:hidden overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold gradient-text">راتایار</span>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-white/5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">
                    {user?.fullName}
                  </div>
                  <div className="text-white/50 text-xs truncate" dir="ltr">
                    {user?.phone}
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      'text-white/60 hover:text-white hover:bg-white/5',
                    )}
                  >
                    <item.icon className="w-5 h-5 text-white/40" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium text-sm">خروج</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NotificationBell() {
  const { data } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => notificationsApi.unreadCount(),
    refetchInterval: 30000,
  });

  const count = data?.data?.count || 0;

  return (
    <Link
      href="/dashboard/notifications"
      className="relative p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-colors"
    >
      <Bell className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
