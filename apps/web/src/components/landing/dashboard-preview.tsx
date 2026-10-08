'use client';

import { motion } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Package, Wallet, Users, FileText,
  Bell, TrendingUp, CheckCircle2, Clock, Sparkles, ShieldCheck,
} from 'lucide-react';

const navItems = [
  { label: 'داشبورد', icon: LayoutDashboard, active: true },
  { label: 'تعهدات', icon: Calendar },
  { label: 'دارایی‌ها', icon: Package },
  { label: 'مالی', icon: Wallet },
  { label: 'خانواده', icon: Users },
  { label: 'اسناد', icon: FileText },
  { label: 'اعلان‌ها', icon: Bell },
];

const cards = [
  {
    title: 'تعهدات فعال',
    value: '۱۲',
    change: '+۳ این هفته',
    icon: Calendar,
    color: 'from-purple-500 to-fuchsia-500',
  },
  {
    title: 'ارزش دارایی‌ها',
    value: '۸۵۰M',
    change: 'تومان',
    icon: Package,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'مصرف ماه',
    value: '۴.۲M',
    change: 'تومان',
    icon: Wallet,
    color: 'from-emerald-500 to-teal-500',
  },
];

const upcoming = [
  { title: 'تمدید بیمه شخص ثالث', days: '۲ روز', urgent: true },
  { title: 'معاینه فنی خودرو', days: '۷ روز', urgent: false },
  { title: 'پرداخت اجاره', days: '۱۵ روز', urgent: false },
];

export function DashboardPreview() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-cyan-400">داشبورد زنده</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-white">همه چیز </span>
            <span className="gradient-text">در یک نگاه</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            داشبوردی که با یک نگاه بهت می‌گه چی مهمه، چی عقب افتاده و چقدر
            پیشرفت کردی.
          </p>
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Glow */}
          <div className="absolute -inset-8 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-[3rem] blur-3xl -z-10" />

          {/* Frame */}
          <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Top bar */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/10 bg-black/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 mx-4 rounded-lg bg-white/5 border border-white/10 px-4 py-1.5 text-xs text-white/40 text-center font-mono">
                ratayar.ir/dashboard
              </div>
            </div>

            <div className="flex" dir="rtl">
              {/* Sidebar */}
              <div className="hidden md:flex w-56 border-l border-white/10 bg-black/20 flex-col p-4 gap-1">
                <div className="flex items-center gap-2 px-2 py-3 mb-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold gradient-text">راتایار</span>
                </div>
                {navItems.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                      item.active
                        ? 'bg-gradient-to-l from-purple-500/20 to-transparent text-white'
                        : 'text-white/50'
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 ${item.active ? 'text-purple-400' : ''}`}
                    />
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 space-y-5">
                {/* Greeting */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/50 text-sm">
                      سلام امیر 👋
                    </div>
                    <div className="text-white text-lg font-bold">
                      امروز چهارشنبه ۱۶ مهر است
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-emerald-300">
                      پلن خانواده
                    </span>
                  </div>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {cards.map((c, i) => (
                    <motion.div
                      key={c.title}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}
                        >
                          <c.icon className="w-4 h-4 text-white" />
                        </div>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="text-white/50 text-xs mb-1">
                        {c.title}
                      </div>
                      <div className="text-white text-2xl font-black">
                        {c.value}
                      </div>
                      <div className="text-white/40 text-xs mt-1">
                        {c.change}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Upcoming + Chart placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upcoming */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <div className="text-white text-sm font-bold">
                        نزدیک‌ترین تعهدات
                      </div>
                    </div>
                    <div className="space-y-2">
                      {upcoming.map((u) => (
                        <div
                          key={u.title}
                          className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2
                              className={`w-4 h-4 ${
                                u.urgent ? 'text-red-400' : 'text-cyan-400'
                              }`}
                            />
                            <span className="text-white/80 text-xs">
                              {u.title}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              u.urgent
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-white/5 text-white/50'
                            }`}
                          >
                            {u.days}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini chart */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-white text-sm font-bold">
                        روند انضباط
                      </div>
                      <span className="text-xs text-emerald-400">
                        +۱۸٪
                      </span>
                    </div>
                    <div className="flex items-end gap-1 h-24">
                      {[40, 55, 35, 70, 60, 80, 65, 90, 75, 95, 85, 100].map(
                        (h, i) => (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${h}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }}
                            className="flex-1 rounded-t-md bg-gradient-to-t from-purple-500/40 to-cyan-400/80"
                          />
                        ),
                      )}
                    </div>
                    <div className="flex justify-between text-[10px] text-white/30 mt-2">
                      <span>فروردین</span>
                      <span>مهر</span>
                    </div>
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
