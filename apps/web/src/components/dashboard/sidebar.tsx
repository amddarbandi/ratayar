'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Sparkles, LayoutDashboard, Calendar, Package, Wallet, Users,
  FileText, Settings, LogOut, Bell, Network, Search, Command,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { authApi } from '@/lib/api';
import { toast } from 'sonner';

const navItems = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/dashboard/obligations', label: 'تعهدات', icon: Calendar },
  { href: '/dashboard/assets', label: 'دارایی‌ها', icon: Package },
  { href: '/dashboard/finance', label: 'مالی', icon: Wallet },
  { href: '/dashboard/family', label: 'خانواده', icon: Users },
  { href: '/dashboard/family-tree', label: 'شجره‌نامه', icon: Network },
  { href: '/dashboard/documents', label: 'اسناد', icon: FileText },
  { href: '/dashboard/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/dashboard/notifications', label: 'اعلان‌ها', icon: Bell },
  { href: '/dashboard/settings', label: 'تنظیمات', icon: Settings },
];

export function DashboardSidebar({
  onSearchClick,
}: {
  onSearchClick?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);

  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac');

  const handleLogout = async () => {
    try {
      await authApi.logout(refreshToken || undefined);
    } catch {}
    logout();
    toast.success('خروج موفق');
    router.push('/');
  };

  return (
    <aside className="hidden lg:flex w-72 min-h-screen flex-col glass-strong border-l border-white/10 sticky top-0 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">راتایار</span>
        </Link>
      </div>

      {/* Search Button */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/30 transition-all group"
        >
          <Search className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors" />
          <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors flex-1 text-right">
            جستجو
          </span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 text-white/50 text-[10px]">
            {isMac ? '⌘' : 'Ctrl'}K
          </kbd>
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
            {user?.fullName?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm truncate">
              {user?.fullName || 'کاربر'}
            </div>
            <div className="text-white/50 text-xs truncate" dir="ltr">
              {user?.phone}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-l from-purple-500/20 to-transparent text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-l-full bg-gradient-to-b from-purple-400 to-cyan-400"
                />
              )}
              <item.icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive
                    ? 'text-purple-400'
                    : 'text-white/40 group-hover:text-white/70',
                )}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">خروج</span>
        </button>
      </div>
    </aside>
  );
}
