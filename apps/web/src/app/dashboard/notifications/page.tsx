'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Loader2, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { notificationsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toJalaliShort } from '@/lib/jalali';

const priorityConfig: any = {
  critical: { bg: 'bg-red-500/10', border: 'border-red-500/30', color: 'text-red-400' },
  important: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', color: 'text-amber-400' },
  normal: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', color: 'text-purple-400' },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ limit: 100 }),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const readAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('همه خوانده شد');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notif-count'] });
    },
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.readAt).length;

  const formatDate = (date: string) => {
    const d = new Date(date);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return 'همین حالا';
    if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} ساعت پیش`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} روز پیش`;
    return toJalaliShort(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">اعلان‌ها</h1>
          <p className="text-white/50">
            {unreadCount > 0 ? `${unreadCount} اعلان خوانده‌نشده` : 'همه خوانده شده'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => readAllMutation.mutate()}
            disabled={readAllMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            خواندن همه
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <Bell className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">هنوز اعلانی نداری</h3>
            <p className="text-white/50">وقتی تعهدی نزدیک شد، اینجا خبردار می‌شوی</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {notifications.map((notif: any, i: number) => {
              const config = priorityConfig[notif.priority] || priorityConfig.normal;
              const isUnread = !notif.readAt;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card className={cn(
                    'group transition-all cursor-pointer',
                    isUnread ? `${config.border} ${config.bg}` : 'hover:border-purple-500/20',
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                          config.bg,
                        )}>
                          <Bell className={cn('w-5 h-5', config.color)} />
                        </div>

                        <div className="flex-1 min-w-0" onClick={() => isUnread && readMutation.mutate(notif.id)}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className={cn(
                              'font-medium text-sm',
                              isUnread ? 'text-white' : 'text-white/60',
                            )}>
                              {notif.title}
                            </h3>
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-purple-400 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          {notif.body && (
                            <p className="text-white/50 text-xs mb-2">{notif.body}</p>
                          )}
                          <div className="text-white/30 text-xs">{formatDate(notif.createdAt)}</div>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              onClick={() => readMutation.mutate(notif.id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-400"
                              title="خوانده شد"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteMutation.mutate(notif.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
