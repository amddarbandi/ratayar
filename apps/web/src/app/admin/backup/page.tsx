'use client';

import { useState } from 'react';
import { Database, Download, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminBackupPage() {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    setLoading(true);
    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('accessToken')
          : null;

      const res = await fetch('/api/admin/backup', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.download = `ratayar-backup-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('فایل بکاپ دانلود شد');
    } catch {
      toast.error('خطا در دریافت بکاپ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            بکاپ پلتفرم
          </h1>
        </div>
        <p className="text-white/50 text-sm">
          خروجی کامل داده‌های پلتفرم به‌صورت یک فایل JSON
        </p>
      </div>

      <Card>
        <CardContent className="p-5 md:p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-white/70 leading-7">
              این بکاپ شامل <strong className="text-white">کاربران، خانواده‌ها، تعهدات،
              دارایی‌ها، اسناد، پلن‌ها، اشتراک‌ها، پرداخت‌ها، تیکت‌ها، لاگ‌ها،
              اسنپ‌شات‌ها، پیام‌های گروهی، تنظیمات و فلگ‌ها</strong> است.
              فایل شامل داده‌های حساس است — در جای امن نگهداری کنید.
            </div>
          </div>

          <button
            onClick={download}
            disabled={loading}
            className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Download className="w-5 h-5" />
                دانلود بکاپ
              </>
            )}
          </button>

          <div className="text-[11px] text-white/40 text-center">
            فایل به‌صورت خودکار با تاریخ و ساعت امروز ذخیره می‌شود.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
