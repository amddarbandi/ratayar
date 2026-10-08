'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, CreditCard, MessageSquare, Users } from 'lucide-react';
import { paymentApi, ticketApi, plansApi } from '@/lib/api';

export default function AdminHome() {
  const [stats, setStats] = useState({
    plans: 0,
    pendingPayments: 0,
    openTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      plansApi.list().catch(() => ({ data: [] })),
      paymentApi.adminAll('pending').catch(() => ({ data: [] })),
      ticketApi.adminAll('open').catch(() => ({ data: [] })),
    ])
      .then(([plans, payments, tickets]) => {
        setStats({
          plans: plans.data?.length || 0,
          pendingPayments: payments.data?.length || 0,
          openTickets: tickets.data?.length || 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'پلن‌های فعال',
      value: stats.plans,
      icon: Package,
      href: '/admin/plans',
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'پرداخت‌های در انتظار',
      value: stats.pendingPayments,
      icon: CreditCard,
      href: '/admin/payments?status=pending',
      color: 'from-orange-500 to-red-500',
    },
    {
      label: 'تیکت‌های باز',
      value: stats.openTickets,
      icon: MessageSquare,
      href: '/admin/tickets?status=open',
      color: 'from-blue-500 to-cyan-500',
    },
  ];

  return (
    <div dir="rtl">
      <h1 className="text-3xl font-bold text-white mb-8">داشبورد مدیریت</h1>

      {loading && <div className="text-white/40">در حال بارگذاری...</div>}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all group"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <c.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-black text-white mb-1">
                {c.value}
              </div>
              <div className="text-white/60 text-sm">{c.label}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
