'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { plansApi } from '@/lib/api';

interface ApiPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  priceMonthly: string;
  maxMembers: number;
  maxObligations: number;
  maxAssets: number;
  maxDocuments: number;
  maxStorageMB: number;
  maxUploadMB: number;
  isPopular?: boolean;
}

interface DisplayPlan {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  href: string;
  highlighted: boolean;
  badge?: string;
}

const FALLBACK: DisplayPlan[] = [
  {
    name: 'رایگان',
    price: '۰',
    period: 'همیشه',
    features: ['۵ تعهد', '۱ کاربر', '۱ سند', 'پشتیبانی ایمیل'],
    cta: 'شروع رایگان',
    href: '/register',
    highlighted: false,
  },
];

function fmtNum(n: number) {
  if (n === -1) return 'بی‌نهایت';
  return n.toLocaleString('fa-IR');
}

function fmtStorage(mb: number) {
  if (mb >= 1024) return `${(mb / 1024).toFixed(0)} GB`;
  return `${mb} MB`;
}

function toDisplay(p: ApiPlan): DisplayPlan {
  const price = Number(p.priceMonthly);
  const isFree = price === 0;
  const features: string[] = [];

  if (p.maxMembers > 1) features.push(`تا ${fmtNum(p.maxMembers)} کاربر`);
  else features.push('۱ کاربر');

  features.push(`${fmtNum(p.maxObligations)} تعهد`);
  features.push(`${fmtNum(p.maxAssets)} دارایی`);
  features.push(`${fmtNum(p.maxDocuments)} سند`);
  features.push(`${fmtStorage(p.maxStorageMB)} فضا`);

  const cta = isFree ? 'شروع رایگان' : `انتخاب ${p.name}`;
  const href = isFree ? '/register' : `/register?plan=${p.code}`;

  return {
    name: p.name,
    price: price.toLocaleString('fa-IR'),
    period: isFree ? 'همیشه' : 'ماهانه',
    features,
    cta,
    href,
    highlighted: !!p.isPopular,
    badge: p.isPopular ? 'محبوب‌ترین' : undefined,
  };
}

export function Pricing() {
  const [plans, setPlans] = useState<DisplayPlan[]>(FALLBACK);

  useEffect(() => {
    plansApi
      .list()
      .then((res) => {
        const data: ApiPlan[] = res.data;
        if (Array.isArray(data) && data.length > 0) {
          setPlans(data.map(toDisplay));
        }
      })
      .catch(() => {
        /* keep fallback */
      });
  }, []);

  return (
    <section id="pricing" className="relative py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
            <span className="text-sm text-pink-400">💰 قیمت‌ها</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-4">
            <span className="text-white">پلن </span>
            <span className="gradient-text-2">مناسب خودت</span>
            <span className="text-white"> را انتخاب کن</span>
          </h2>
          <p className="text-white/60 text-lg">
            همیشه کمتر از صرفه‌جویی شما
          </p>
        </motion.div>

        <div
          className={`grid grid-cols-1 md:grid-cols-2 ${
            plans.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          } gap-6`}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bento-item p-8 !overflow-visible ${
                plan.highlighted
                  ? 'ring-2 ring-purple-500/50 shadow-2xl shadow-purple-500/20 lg:scale-105'
                  : ''
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white text-xs font-bold shadow-xl shadow-purple-500/50 border border-white/20 backdrop-blur-md ring-2 ring-white/10 whitespace-nowrap">
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  {plan.badge}
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span
                    className={`text-4xl font-black ${
                      plan.highlighted ? 'gradient-text' : 'text-white'
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span className="text-white/50 text-sm">تومان</span>
                </div>
                <span className="text-white/50 text-sm">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-white/70"
                  >
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block w-full text-center px-6 py-3 rounded-xl font-medium transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/30'
                    : 'glass hover:bg-white/10 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
