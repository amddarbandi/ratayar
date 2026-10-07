'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Shield, Zap, Users } from 'lucide-react';

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
            از ۷ سال تا ۱۰۰ سال. از فرد تا خانواده. از خانواده تا کسب‌وکار.
            <br />
            همه چیز در یک پلتفرم مدرن، هوشمند و امن.
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
            <div className="relative rounded-2xl bg-[#0A0A0F] p-8 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-float">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <p className="text-white/40 text-lg">
                  داشبورد زیبای راتایار
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
