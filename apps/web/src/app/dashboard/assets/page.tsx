'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Package, Car, Home, Smartphone, Wallet,
  Trash2, TrendingUp, Loader2, Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { assetsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const typeConfig: any = {
  vehicle: {
    label: 'خودرو',
    icon: Car,
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10',
    color: 'text-cyan-400',
    emoji: '🚗',
  },
  property: {
    label: 'ملک',
    icon: Home,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    color: 'text-emerald-400',
    emoji: '🏠',
  },
  appliance: {
    label: 'لوازم خانگی',
    icon: Package,
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10',
    color: 'text-purple-400',
    emoji: '🧊',
  },
  electronics: {
    label: 'الکترونیکی',
    icon: Smartphone,
    gradient: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/10',
    color: 'text-orange-400',
    emoji: '📱',
  },
  financial: {
    label: 'مالی',
    icon: Wallet,
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10',
    color: 'text-yellow-400',
    emoji: '💰',
  },
  other: {
    label: 'سایر',
    icon: Package,
    gradient: 'from-gray-500 to-slate-500',
    bg: 'bg-white/5',
    color: 'text-white/50',
    emoji: '📦',
  },
};

const filters = [
  { key: 'all', label: 'همه' },
  { key: 'vehicle', label: '🚗 خودرو' },
  { key: 'property', label: '🏠 ملک' },
  { key: 'appliance', label: '🧊 لوازم' },
  { key: 'electronics', label: '📱 الکترونیک' },
  { key: 'financial', label: '💰 مالی' },
];

const formatPrice = (price: number) => {
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} میلیارد`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(0)} میلیون`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)} هزار`;
  return `${price}`;
};

export default function AssetsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['assets', filter],
    queryFn: () => assetsApi.list(filter === 'all' ? undefined : { type: filter }),
  });

  const { data: statsData } = useQuery({
    queryKey: ['assets-stats'],
    queryFn: () => assetsApi.stats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => assetsApi.remove(id),
    onSuccess: () => {
      toast.success('دارایی حذف شد');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets-stats'] });
    },
  });

  const assets = assetsData?.data || [];
  const stats = statsData?.data || { total: 0, totalValue: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">دارایی‌ها</h1>
          <p className="text-white/50">مدیریت تمام دارایی‌های شما</p>
        </div>
        <Link
          href="/dashboard/assets/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-500/30 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          دارایی جدید
        </Link>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-white/50 text-sm">تعداد دارایی‌ها</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:col-span-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold text-white">
                  {formatPrice(stats.totalValue)} تومان
                </div>
                <div className="text-white/50 text-sm">ارزش کل دارایی‌ها</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              filter === f.key
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : assets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              هنوز دارایی‌ای نداری
            </h3>
            <p className="text-white/50 mb-6">
              خودرو، خانه یا لوازم خود را اضافه کن تا راتایار تعهداتش را بسازد
            </p>
            <Link
              href="/dashboard/assets/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              افزودن اولین دارایی
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {assets.map((asset: any, i: number) => {
              const config = typeConfig[asset.type] || typeConfig.other;
              const Icon = config.icon;

              return (
                <motion.div
                  key={asset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="group hover:border-purple-500/30 transition-all">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br',
                          config.gradient,
                        )}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-white text-lg truncate">
                              {asset.name}
                            </h3>
                            <span className={cn(
                              'px-2.5 py-1 rounded-full text-xs whitespace-nowrap',
                              config.bg,
                              config.color,
                            )}>
                              {config.emoji} {config.label}
                            </span>
                          </div>

                          {asset.model && (
                            <p className="text-white/50 text-sm mb-1">
                              {asset.model} {asset.year && `— ${asset.year}`}
                            </p>
                          )}

                          {asset.currentValue && (
                            <div className="flex items-baseline gap-2 mt-3">
                              <span className="text-white/40 text-xs">ارزش فعلی:</span>
                              <span className="text-white font-bold">
                                {formatPrice(asset.currentValue)} تومان
                              </span>
                            </div>
                          )}

                          {asset.purchasePrice && asset.currentValue && (
                            <div className="flex items-center gap-1 mt-1">
                              {asset.currentValue > asset.purchasePrice ? (
                                <span className="text-emerald-400 text-xs">
                                  ↗ {Math.round(((asset.currentValue - asset.purchasePrice) / asset.purchasePrice) * 100)}٪ رشد
                                </span>
                              ) : asset.currentValue < asset.purchasePrice ? (
                                <span className="text-red-400 text-xs">
                                  ↘ {Math.round(((asset.purchasePrice - asset.currentValue) / asset.purchasePrice) * 100)}٪ کاهش
                                </span>
                              ) : null}
                            </div>
                          )}

                          <div className="mt-4 flex items-center gap-2">
                            <button
                              onClick={() => {
                                if (confirm(`«${asset.name}» حذف شود؟`)) {
                                  deleteMutation.mutate(asset.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-1"
                            >
                              {deleteMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              حذف
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
