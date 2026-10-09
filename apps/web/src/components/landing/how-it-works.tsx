'use client';

import { motion } from 'framer-motion';
import { UserPlus, Settings, Rocket, TrendingUp } from 'lucide-react';

const steps = [
  {
    number: '۰۱',
    icon: UserPlus,
    title: 'ثبت‌نام سریع',
    desc: 'در کمتر از ۳۰ ثانیه با شماره موبایل ثبت‌نام کنید',
  },
  {
    number: '۰۲',
    icon: Settings,
    title: 'شخصی‌سازی',
    desc: 'دارایی‌ها و تعهدات خود را اضافه کنید',
  },
  {
    number: '۰۳',
    icon: Rocket,
    title: 'خانواده را وصل کنید',
    desc: 'اعضای خانواده را دعوت کنید',
  },
  {
    number: '۰۴',
    icon: TrendingUp,
    title: 'آرامش بگیرید',
    desc: 'دیگر نگران فراموشی نباشید',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <span className="text-sm text-cyan-400">🚀 چطور کار می‌کند</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-white">در </span>
            <span className="gradient-text-2">۴ قدم ساده</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto mt-4">
            هیچ تعهدی فراموش نمی‌شود، هیچ هزینه‌ای از قلم نمی‌افتد
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector Line */}
          <div className="hidden lg:block absolute top-16 right-0 left-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="relative bento-item p-6 text-center">
                {/* Icon */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-2xl blur-xl opacity-50" />
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Number */}
                <span className="absolute top-4 right-6 text-white/5 text-6xl font-black">
                  {step.number}
                </span>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
