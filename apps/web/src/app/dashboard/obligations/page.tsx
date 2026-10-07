'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, AlertCircle, CheckCircle2, Clock, Trash2,
  Filter, Check, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { obligationsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const categories = [
  { key: 'all', label: 'همه', emoji: '📋' },
  { key: 'financial', label: 'مالی', emoji: '💰' },
  { key: 'health', label: 'سلامت', emoji: '💊' },
  { key: 'life', label: 'زندگی', emoji: '🌱' },
  { key: 'family', label: 'خانواده', emoji: '👨‍👩‍👧' },
  { key: 'business', label: 'کسب‌وکار', emoji: '🏪' },
];

const priorityConfig: any = {
  critical: {
    badge: 'bg-red-500/20 text-red-300 border-red-500/30',
    icon: AlertCircle,
    iconColor: 'text-red-400',
    iconBg: 'bg-red-500/10',
  },
  important: {
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: Clock,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
  },
  normal: {
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    icon: CheckCircle2,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
  },
  optional: {
    badge: 'bg-white/10 text-white/60 border-white/20',
    icon: CheckCircle2,
    iconColor: 'text-white/50',
    iconBg: 'bg-white/5',
  },
};

export default function ObligationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['obligations', filter],
    queryFn: () =>
      obligationsApi.list(filter === 'all' ? undefined : { category: filter }),
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => obligationsApi.complete(id),
    onSuccess: () => {
      toast.success('تعهد انجام شد ✅');
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => obligationsApi.remove(id),
    onSuccess: () => {
      toast.success('تعهد حذف شد');
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
    },
  });

  const obligations = data?.data || [];

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diff < 0) return `${Math.abs(diff)} روز گذشته`;
    if (diff === 0) return 'امروز';
    if (diff === 1) return 'فردا';
    if (diff < 30) return `${diff} روز دیگر`;
    return d.toLocaleDateString('fa-IR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">تعهدات</h1>
          <p className="text-white/50">مدیریت تمام تعهدات و یادآورها</p>
        </div>
        <Link
          href="/dashboard/obligations/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-500/30 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          تعهد جدید
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-white/40 flex-shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5',
              filter === cat.key
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10',
            )}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : obligations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              هنوز تعهدی نداری
            </h3>
            <p className="text-white/50 mb-6">
              اولین تعهدت رو بساز و راتایار حواسش بهت باشه
            </p>
            <Link
              href="/dashboard/obligations/new"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:scale-105 transition-all"
            >
              <Plus className="w-5 h-5" />
              ساخت اولین تعهد
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {obligations.map((ob: any, i: number) => {
              const config = priorityConfig[ob.priority] || priorityConfig.normal;
              const Icon = config.icon;
              const isCompleted = ob.status === 'completed';

              return (
                <motion.div
                  key={ob.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={cn(
                    'group transition-all',
                    isCompleted ? 'opacity-50' : 'hover:border-purple-500/30'
                  )}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                          config.iconBg
                        )}>
                          <Icon className={cn('w-6 h-6', config.iconColor)} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h3 className={cn(
                              'font-bold text-white text-lg',
                              isCompleted && 'line-through'
                            )}>
                              {ob.title}
                            </h3>
                            <span className={cn(
                              'px-3 py-1 rounded-full text-xs border whitespace-nowrap',
                              config.badge
                            )}>
                              {isCompleted ? 'انجام شد' : formatDate(ob.dueDate)}
                            </span>
                          </div>
                          {ob.description && (
                            <p className="text-white/50 text-sm mb-3">
                              {ob.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            {!isCompleted && (
                              <button
                                onClick={() => completeMutation.mutate(ob.id)}
                                disabled={completeMutation.isPending}
                                className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                              >
                                {completeMutation.isPending ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                انجام شد
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('این تعهد حذف شود؟')) {
                                  deleteMutation.mutate(ob.id);
                                }
                              }}
                              className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
