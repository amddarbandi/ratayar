'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import {
  LayoutDashboard, Package, CreditCard, MessageSquare, ChevronLeft,
  Shield, Users, Calendar, BarChart3, FileText, ListChecks, Bell, Settings, Activity, HardDrive, Megaphone, Flag, Database, LineChart, ShieldAlert, KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/brand/logo';

const items = [
  { href: '/admin', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/admin/users', label: 'کاربران', icon: Users },
  { href: '/admin/subscriptions', label: 'اشتراک‌ها', icon: Calendar },
  { href: '/admin/revenue', label: 'درآمد', icon: BarChart3 },
  { href: '/admin/plans', label: 'پلن‌ها', icon: Package },
  { href: '/admin/payments', label: 'پرداخت‌ها', icon: CreditCard },
  { href: '/admin/tickets', label: 'تیکت‌ها', icon: MessageSquare },
  { href: '/admin/documents', label: 'اسناد', icon: FileText },
  { href: '/admin/obligations', label: 'تعهدات', icon: ListChecks },
  { href: '/admin/notifications', label: 'اعلان‌ها', icon: Bell },
  { href: '/admin/broadcast', label: 'ارسال گروهی', icon: Megaphone },
  { href: '/admin/analytics', label: 'آنالیتیکس', icon: LineChart },
  { href: '/admin/abuse', label: 'کنترل دسترسی', icon: ShieldAlert },
  { href: '/admin/api-keys', label: 'کلیدهای API', icon: KeyRound },
  { href: '/admin/audit-log', label: 'لاگ اقدامات', icon: Activity },
  { href: '/admin/settings', label: 'تنظیمات پلتفرم', icon: Settings },
  { href: '/admin/flags', label: 'فلگ‌های ویژگی', icon: Flag },
  { href: '/admin/backup', label: 'بکاپ', icon: Database },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && (!user || (user as any).role !== 'admin')) {
      router.replace('/dashboard');
    }
  }, [hydrated, user, router]);

  if (!hydrated || !user || (user as any).role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/40">
        در حال بررسی دسترسی...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      <div className="fixed inset-0 -z-10 grid-pattern opacity-30" />
      <div className="fixed top-0 right-1/3 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-[120px] -z-10" />

      <div className="flex">
        {/* Admin Sidebar */}
        <aside className="w-64 min-h-screen border-l border-white/10 bg-black/30 backdrop-blur sticky top-0 h-screen flex flex-col">
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2">
              <LogoIcon size={40} />
              <div>
                <div className="text-white font-bold">پنل مدیریت</div>
                <div className="text-white/40 text-xs">راتایار</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                    isActive
                      ? 'bg-gradient-to-l from-red-500/20 to-transparent text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5',
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5',
                      isActive ? 'text-red-400' : 'text-white/40',
                    )}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              بازگشت به داشبورد
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-8" dir="rtl">
          {children}
        </main>
      </div>
    </div>
  );
}
