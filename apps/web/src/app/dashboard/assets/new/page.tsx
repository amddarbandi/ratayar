'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Save } from 'lucide-react';
import { toast } from 'sonner';
import { assetsApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const assetTypes = [
  { key: 'vehicle', label: 'خودرو', emoji: '🚗', desc: 'ماشین، موتور' },
  { key: 'property', label: 'ملک', emoji: '🏠', desc: 'خانه، زمین، مغازه' },
  { key: 'appliance', label: 'لوازم خانگی', emoji: '🧊', desc: 'یخچال، ماشین لباسشویی' },
  { key: 'electronics', label: 'الکترونیکی', emoji: '📱', desc: 'موبایل، لپ‌تاپ' },
  { key: 'financial', label: 'مالی', emoji: '💰', desc: 'سپرده، طلا، ارز' },
  { key: 'other', label: 'سایر', emoji: '📦', desc: 'سایر دارایی‌ها' },
];

export default function NewAssetPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [type, setType] = useState('vehicle');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  const [notes, setNotes] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => assetsApi.create(data),
    onSuccess: () => {
      toast.success('دارایی ساخته شد ✅');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['assets-stats'] });
      router.push('/dashboard/assets');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در ساخت دارایی');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('نام دارایی را وارد کن');
      return;
    }

    createMutation.mutate({
      type,
      name: name.trim(),
      model: model.trim() || undefined,
      year: year ? parseInt(year) : undefined,
      purchasePrice: purchasePrice ? parseInt(purchasePrice) : undefined,
      currentValue: currentValue ? parseInt(currentValue) : undefined,
      notes: notes.trim() || undefined,
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
          <h1 className="text-2xl font-bold text-white">دارایی جدید</h1>
          <p className="text-white/50 text-sm">اطلاعات دارایی را وارد کن</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-bold text-white mb-4">نوع دارایی</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {assetTypes.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-2xl transition-all',
                    type === t.key
                      ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                      : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <span className="text-3xl">{t.emoji}</span>
                  <span className="text-sm font-bold">{t.label}</span>
                  <span className="text-xs opacity-70">{t.desc}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardContent className="p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">اطلاعات اصلی</h2>

            <Input
              label="نام دارایی"
              placeholder="مثلاً: پراید ۱۴۰۰ یا خانه تهران"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="مدل / برند (اختیاری)"
                placeholder="مثلاً: پراید یا سامسونگ"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />

              <Input
                label="سال ساخت (اختیاری)"
                placeholder="۱۴۰۰"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                dir="ltr"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="قیمت خرید (تومان)"
                placeholder="200000000"
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                dir="ltr"
              />

              <Input
                label="ارزش فعلی (تومان)"
                placeholder="250000000"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                یادداشت (اختیاری)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توضیحات بیشتر..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-purple-500/10 transition-all resize-none"
              />
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
            افزودن دارایی
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
