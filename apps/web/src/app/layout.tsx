import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { RegisterSW } from '@/components/pwa/register-sw';
import { Toaster } from 'sonner';
import './globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic', 'latin'],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'راتایار — دستیار هوشمند زندگی',
    template: '%s | راتایار',
  },
  description:
    'راتایار، دستیار هوشمند زندگی. مدیریت تعهدات، دارایی‌ها، اسناد و خانواده در یک پلتفرم مدرن.',
  keywords: ['راتایار', 'دستیار هوشمند', 'مدیریت زندگی', 'یادآور', 'خانواده'],
  authors: [{ name: 'Ratayar' }],
  creator: 'Ratayar',
  metadataBase: new URL('https://ratayar.ir'),
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'راتایار',
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'fa_IR',
    siteName: 'راتایار',
    title: 'راتایار — دستیار هوشمند زندگی',
    description: 'دستیار هوشمند زندگی',
  },
};

export const viewport: Viewport = {
  themeColor: '#a855f7',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazirmatn.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-center"
              theme="dark"
              richColors
              closeButton
            />
          </QueryProvider>
        </ThemeProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
