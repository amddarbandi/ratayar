'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="relative py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl p-12 md:p-20 text-center"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 animated-gradient opacity-20" />
          <div className="absolute inset-0 bg-[#0A0A0F]/60" />
          <div className="absolute inset-0 grid-pattern opacity-30" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-white/80">
                همین حالا شروع کن
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              آماده‌ای زندگی‌ات را
              <br />
              <span className="gradient-text-2">هوشمند</span> کنی؟
            </h2>

            <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto">
              زندگی را ساده‌تر، منظم‌تر و امن‌تر کن
            </p>

            <Link
              href="/register"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-bold text-lg transition-all shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105"
            >
              شروع رایگان
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
