'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api';
import { Bell, Sparkles, Search } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';

export function DashboardHeader({
  onSearchClick,
}: {
  onSearchClick?: () => void;
}) {
  const user = useAuthStore((s) => s.user);


  const isMac =
    typeof navigator !== 'undefined' &&
    navigator.platform.toLowerCase().includes('mac');

  return (
    <>
      <header className="sticky top-0 z-40 glass-strong border-b border-white/10">
        <div className="flex items-center justify-between gap-3 px-4 lg:px-8 h-16">
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
            <kbd className="hidden md:flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/10 text-white/50 text-xs md:text-sm md:text-xs">
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
        <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs md:text-sm md:text-xs font-bold flex items-center justify-center">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
