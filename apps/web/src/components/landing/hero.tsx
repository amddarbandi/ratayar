'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Shield, Zap, Users, Calendar, Package, Wallet, TrendingUp } from 'lucide-react';
import { LogoIcon } from '@/components/brand/logo';

const badges = [
  { icon: Shield, label: 'امنیت بانکی' },
  { icon: Zap, label: 'سرعت برق‌آسا' },
  { icon: Users, label: 'برای همه سنین' },
];

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Top Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white/80">
              نسخه بتا — همین حالا امتحان کنید
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6"
          >
            <span className="gradient-text-2">راتایار</span>
            <br />
            <span className="text-white/90 text-3xl md:text-5xl lg:text-6xl font-bold">
              دستیار هوشمند زندگی
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            دستیار هوشمند زندگی — مدیریت تعهدات، دارایی‌ها، اسناد و خانواده در یک اپ
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <Link
              href="/register"
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-medium text-lg transition-all shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105 flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">شروع رایگان</span>
              <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 opacity-0 group-hover:opacity-40 transition-opacity duration-500" />
            </Link>

            <Link
              href="#how"
              className="px-8 py-4 rounded-2xl glass hover:bg-white/10 text-white font-medium text-lg transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              چطور کار می‌کند
            </Link>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {badges.map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-white/70"
              >
                <badge.icon className="w-4 h-4 text-purple-400" />
                {badge.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating Preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 max-w-6xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden glass-strong p-2 shadow-2xl shadow-purple-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-cyan-500/20" />
            <div className="relative rounded-2xl bg-gradient-to-br from-[#0A0A0F] via-[#12101c] to-[#0d0f15] p-6 md:p-10 min-h-[400px] overflow-hidden">
              {/* ambient glow */}
              <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto" dir="rtl">
                {/* Logo badge */}
                <div className="md:col-span-3 flex items-center justify-center mb-2">
                  <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <LogoIcon size={28} />
                    <span className="text-sm text-white/70">
                      پیش‌نمایش داشبورد
                    </span>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/15 to-white/[0.02] p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-white/50 text-xs">تعهدات فعال</div>
                  <div className="text-white text-2xl font-black">۱۲</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/15 to-white/[0.02] p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-white/50 text-xs">ارزش دارایی‌ها</div>
                  <div className="text-white text-2xl font-black">۸۵۰M</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-500/15 to-white/[0.02] p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-white/50 text-xs">مصرف ماه</div>
                  <div className="text-white text-2xl font-black">۴.۲M</div>
                </div>

                {/* Mini chart */}
                <div className="md:col-span-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl mt-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white text-sm font-bold">
                      روند انضباط
                    </span>
                    <span className="text-xs text-emerald-400">+۱۸٪</span>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 55, 35, 70, 60, 80, 65, 90, 75, 95, 85, 100].map(
                      (h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className="flex-1 rounded-t-md bg-gradient-to-t from-purple-500/40 to-cyan-400/80"
                        />
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
