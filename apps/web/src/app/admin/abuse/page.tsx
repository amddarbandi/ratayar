'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Plus, Trash2, X, Loader2, Ban } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { toJalaliDateTime } from '@/lib/jalali';

interface BlockedRow {
  id: string;
  ip: string;
  reason: string | null;
  blockedBy: string | null;
  until: string | null;
  createdAt: string;
}

export default function AdminAbusePage() {
  const [items, setItems] = useState<BlockedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [ip, setIp] = useState('');
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listBlockedIps()
      .then((res) => setItems(res.data.items))
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const add = async () => {
    if (!ip || ip.length < 4) {
      toast.error('IP معتبر وارد کنید');
      return;
    }
    setSaving(true);
    try {
      await adminApi.blockIp({
        ip: ip.trim(),
        reason: reason.trim() || undefined,
        until: until || undefined,
      });
      toast.success('IP مسدود شد');
      setShowModal(false);
      setIp('');
      setReason('');
      setUntil('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (row: BlockedRow) => {
    if (!confirm(`آدرس ${row.ip} از مسدودی خارج شود؟`)) return;
    try {
      await adminApi.unblockIp(row.ip);
      toast.success('رفع مسدودی شد');
      load();
    } catch {
      toast.error('خطا');
    }
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              کنترل دسترسی
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            مسدودسازی آدرس‌های IP متخلف
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="min-h-[44px] px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          مسدودسازی IP
        </button>
      </div>

      {loading && items.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Ban className="w-8 h-8 text-white/30 mx-auto mb-3" />
            <div className="text-white/40 text-sm">
              هیچ IP مسدودی وجود ندارد.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.map((row, i) => (
          <motion.div
            key={row.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm text-white" dir="ltr">
                        {row.ip}
                      </span>
                      {row.until ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300">
                          تا {toJalaliDateTime(row.until)}
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">
                          دائمی
                        </span>
                      )}
                    </div>
                    {row.reason && (
                      <div className="text-white/60 text-xs">{row.reason}</div>
                    )}
                    <div className="text-white/30 text-[10px] mt-1">
                      ثبت: {toJalaliDateTime(row.createdAt)}
                    </div>
                  </div>
                  <button
                    onClick={() => remove(row)}
                    className="min-h-[40px] min-w-[40px] rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-center"
                    aria-label="رفع مسدودی"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setShowModal(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50 rounded-3xl border border-white/10 bg-[#0f0f16] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">مسدودسازی IP</h3>
              <button onClick={() => setShowModal(false)} className="text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">IP *</label>
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => setIp(e.target.value)}
                  placeholder="1.2.3.4"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">دلیل</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">
                  مدت (خالی = دائمی)
                </label>
                <input
                  type="datetime-local"
                  value={until}
                  onChange={(e) => setUntil(e.target.value)}
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                />
              </div>
            </div>

            <button
              onClick={add}
              disabled={saving}
              className="w-full mt-4 min-h-[48px] rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'مسدود کن'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
