'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function OfflinePage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      <div className="fixed inset-0 -z-10 grid-pattern opacity-50" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px] -z-10" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 flex items-center justify-center">
              <WifiOff className="w-10 h-10 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-3">
              اتصال اینترنت قطع است
            </h1>
            <p className="text-white/60 mb-8 leading-relaxed">
              ظاهراً در حال حاضر آفلاین هستی. اتصال خود را بررسی کن و دوباره
              تلاش کن.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-500/30"
              >
                <RefreshCw className="w-5 h-5" />
                تلاش دوباره
              </button>

              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl glass hover:bg-white/10 text-white font-medium transition-all"
              >
                <Home className="w-5 h-5" />
                صفحه اصلی
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-white/40 text-xs">
                راتایار — حتی در حالت آفلاین هم کنارت است
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
