'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Save } from 'lucide-react';
import { toast } from 'sonner';
import { obligationsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { JalaliDatePicker } from '@/components/common/jalali-date-picker';

const categories = [
  { key: 'financial', label: 'مالی', emoji: '💰' },
  { key: 'health', label: 'سلامت', emoji: '💊' },
  { key: 'life', label: 'زندگی', emoji: '🌱' },
  { key: 'family', label: 'خانواده', emoji: '👨‍👩‍👧' },
  { key: 'business', label: 'کسب‌وکار', emoji: '🏪' },
];

const priorities = [
  { key: 'critical', label: 'بحرانی' },
  { key: 'important', label: 'مهم' },
  { key: 'normal', label: 'معمولی' },
  { key: 'optional', label: 'اختیاری' },
];

const repeatTypes = [
  { key: 'once', label: 'یک‌بار' },
  { key: 'daily', label: 'روزانه' },
  { key: 'weekly', label: 'هفتگی' },
  { key: 'monthly', label: 'ماهانه' },
  { key: 'yearly', label: 'سالانه' },
];

export default function NewObligationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('life');
  const [priority, setPriority] = useState('normal');
  const [repeatType, setRepeatType] = useState('once');

  const createMutation = useMutation({
    mutationFn: (data: any) => obligationsApi.create(data),
    onSuccess: () => {
      toast.success('تعهد ساخته شد ✅');
      queryClient.invalidateQueries({ queryKey: ['obligations'] });
      router.push('/dashboard/obligations');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در ساخت تعهد');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('عنوان را وارد کن');
      return;
    }
    if (!dueDate) {
      toast.error('تاریخ سررسید را انتخاب کن');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: new Date(dueDate).toISOString(),
      category,
      priority,
      repeatType,
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">تعهد جدید</h1>
          <p className="text-white/50 text-sm">اطلاعات تعهد را وارد کن</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">اطلاعات اصلی</h2>

            <Input
              label="عنوان تعهد"
              placeholder="مثلاً: تمدید بیمه شخص ثالث"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                توضیحات (اختیاری)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="توضیحات بیشتر..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-purple-500/10 transition-all resize-none"
              />
            </div>

            <JalaliDatePicker
              label="تاریخ سررسید"
              required
              value={dueDate || null}
              onChange={(iso) => setDueDate(iso)}
            />
          </CardContent>
        </Card>

        {/* Category */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">دسته‌بندی</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all',
                    category === cat.key
                      ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                      : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">اولویت</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {priorities.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPriority(p.key)}
                  className={cn(
                    'p-3 rounded-xl text-sm font-medium transition-all',
                    priority === p.key
                      ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                      : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Repeat */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">تکرار</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {repeatTypes.map((rt) => (
                <button
                  key={rt.key}
                  type="button"
                  onClick={() => setRepeatType(rt.key)}
                  className={cn(
                    'p-3 rounded-xl text-sm font-medium transition-all',
                    repeatType === rt.key
                      ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                      : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10',
                  )}
                >
                  {rt.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            isLoading={createMutation.isPending}
          >
            <Save className="w-5 h-5" />
            ساخت تعهد
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
