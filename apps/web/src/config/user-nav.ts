// ═══════════════════════════════════════════
// Single source of truth for user dashboard nav.
// BOTH the desktop sidebar and the mobile menu read from this file.
// R11 (menu parity) is guaranteed by construction.
// ═══════════════════════════════════════════

import {
  LayoutDashboard, Calendar, Package, Wallet, Users, Network,
  FileText, HardDrive, Repeat, TrendingUp, BarChart3, MessageSquare,
  Bell, Crown, Settings, Shield, type LucideIcon,
} from 'lucide-react';

export interface UserNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  adminOnly?: boolean;
  primary?: boolean;
}

export const USER_NAV_ITEMS: UserNavItem[] = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard, exact: true, primary: true },
  { href: '/dashboard/obligations', label: 'تعهدات', icon: Calendar, primary: true },
  { href: '/dashboard/assets', label: 'دارایی‌ها', icon: Package },
  { href: '/dashboard/finance', label: 'مالی', icon: Wallet, primary: true },
  { href: '/dashboard/family', label: 'خانواده', icon: Users },
  { href: '/dashboard/family-tree', label: 'شجره‌نامه', icon: Network },
  { href: '/dashboard/documents', label: 'اسناد', icon: FileText },
  { href: '/dashboard/storage', label: 'فضای ذخیره‌سازی', icon: HardDrive },
  { href: '/dashboard/converters', label: 'تبدیل', icon: Repeat },
  { href: '/dashboard/market', label: 'بازار و قیمت‌ها', icon: TrendingUp, primary: true },
  { href: '/dashboard/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/dashboard/tickets', label: 'تیکت‌های پشتیبانی', icon: MessageSquare },
  { href: '/dashboard/notifications', label: 'اعلان‌ها', icon: Bell },
  { href: '/dashboard/upgrade', label: 'ارتقای پلن', icon: Crown },
  { href: '/dashboard/calendar', label: 'تقویم', icon: Calendar },
  { href: '/dashboard/settings', label: 'تنظیمات', icon: Settings },
  { href: '/dashboard/network', label: 'IP', icon: Network },
  { href: '/admin', label: 'پنل مدیریت', icon: Shield, adminOnly: true },
];

/** Items visible to a given role. */
export function userNavFor(role: string | undefined): UserNavItem[] {
  return USER_NAV_ITEMS.filter((it) => !it.adminOnly || role === 'admin');
}
