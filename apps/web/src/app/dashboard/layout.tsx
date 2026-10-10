'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { EmailVerifyBanner } from '@/components/dashboard/email-verify-banner';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { SearchModal } from '@/components/search/search-modal';
import { MobileNav } from '@/components/dashboard/mobile-nav';
import { useSearchShortcut } from '@/hooks/use-search-shortcut';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchShortcut();

  useEffect(() => {
    if (hydrated && (!isAuthenticated || !user)) {
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, user, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse" />
        <div className="text-white/40 text-sm">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 animate-pulse" />
        <div className="text-white/40 text-sm">در حال انتقال...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 grid-pattern opacity-30" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] -z-10" />

      <div className="flex">
        <DashboardSidebar onSearchClick={() => setSearchOpen(true)} />
        <div className="flex-1 min-h-screen">
          <DashboardHeader onSearchClick={() => setSearchOpen(true)} />
          <main className="p-6 lg:p-8">
            <EmailVerifyBanner />
            {children}
          </main>
        </div>
      </div>

      <MobileNav />
      <InstallPrompt />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
