'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  Shield,
  Users,
  Wallet,
  Heart,
  Briefcase,
  Calendar,
  FileText,
} from 'lucide-react';

const features = [
  {
    icon: Bell,
    title: 'یادآور هوشمند',
    desc: 'هرگز تعهدی را فراموش نکنید',
    size: 'large',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Wallet,
    title: 'مدیریت مالی',
    desc: 'کنترل کامل هزینه‌ها',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Heart,
    title: 'سلامت خانواده',
    desc: 'دارو، فشار، دکتر',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Users,
    title: 'درخت خانوادگی',
    desc: 'اتصال همه اعضا',
    size: 'large',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: Briefcase,
    title: 'مدیریت کسب‌وکار',
    desc: 'مالیات، بیمه، مجوز',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Shield,
    title: 'اسناد امن',
    desc: 'رمزنگاری سرتاسری',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: Calendar,
    title: 'تقویم هوشمند',
    desc: 'همه رویدادها یک‌جا',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: FileText,
    title: 'گزارش‌های مدرن',
    desc: 'نمودارهای سه‌بعدی',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24">
      <div className="container mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <span className="text-sm text-purple-400">✨ ویژگی‌ها</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            <span className="gradient-text-2">همه چیز</span>
            <span className="text-white"> در یک اپ</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            دستیار هوشمند مدیریت زندگی روزمره
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`bento-item p-6 group cursor-pointer ${
                feature.size === 'large' ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              {/* Gradient Glow */}
              <div
                className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity duration-500`}
              />

              {/* Icon */}
              <div
                className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500 shadow-lg`}
              >
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <h3
                className={`font-bold text-white mb-2 ${
                  feature.size === 'large' ? 'text-2xl' : 'text-xl'
                }`}
              >
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.desc}
              </p>

              {/* Decorative */}
              {feature.size === 'large' && (
                <div className="absolute bottom-4 left-4 text-white/5 text-6xl font-black">
                  ۰۱
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
