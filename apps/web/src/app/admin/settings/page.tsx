'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliDateTime } from '@/lib/jalali';
import { EmailSettings } from '@/components/admin/email-settings';

interface Setting {
  key: string;
  value: any;
  description: string | null;
  category: string;
  updatedBy: string | null;
  updatedAt: string;
  createdAt: string;
}

const CATEGORIES = [
  { key: 'general', label: 'عمومی' },
  { key: 'payment', label: 'پرداخت' },
  { key: 'sms', label: 'پیامک' },
  { key: 'branding', label: 'برندینگ' },
  { key: 'limits', label: 'محدودیت‌ها' },
];

export default function AdminSettingsPage() {
  const [items, setItems] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Setting | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listSettings()
      .then((res) => setItems(res.data.items))
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing({
      key: '',
      value: {},
      description: '',
      category: 'general',
      updatedBy: null,
      updatedAt: '',
      createdAt: '',
    });
    setIsNew(true);
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.key || editing.key.length < 2) {
      toast.error('کلید الزامی است');
      return;
    }
    setSaving(true);
    try {
      let parsedValue = editing.value;
      if (typeof editing.value === 'string') {
        try {
          parsedValue = JSON.parse(editing.value);
        } catch {
          parsedValue = editing.value;
        }
      }
      await adminApi.upsertSetting(editing.key, {
        value: parsedValue,
        description: editing.description || undefined,
        category: editing.category,
      });
      toast.success('ذخیره شد');
      setEditing(null);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Setting) => {
    if (!confirm(`«${s.key}» حذف شود؟`)) return;
    try {
      await adminApi.deleteSetting(s.key);
      toast.success('حذف شد');
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-500 to-cyan-500 flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              تنظیمات پلتفرم
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            مقادیر قابل تنظیم بدون نیاز به تغییر کد
          </p>
        </div>
        <button
          onClick={openNew}
          className="min-h-[44px] px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          تنظیم جدید
        </button>
      </div>

      {/* Email verification + SMTP settings (special UI) */}
      <EmailSettings />

      {/* Email verification + SMTP settings (special UI) */}

      {loading && items.length === 0 && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
          هیچ تنظیمی ثبت نشده است.
        </div>
      )}

      <div className="space-y-2">
        {items.map((s, i) => (
          <motion.div
            key={s.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-mono text-xs text-white/90">{s.key}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300">
                        {s.category}
                      </span>
                    </div>
                    {s.description && (
                      <div className="text-white/50 text-xs mb-1">{s.description}</div>
                    )}
                    <div className="text-white/60 text-[11px] font-mono break-all bg-white/[0.03] rounded-lg p-2 mt-2">
                      {JSON.stringify(s.value)}
                    </div>
                    <div className="text-white/30 text-[10px] mt-2">
                      آخرین ویرایش: {s.updatedAt ? toJalaliDateTime(s.updatedAt) : '—'}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditing(s); setIsNew(false); }}
                      className="min-h-[40px] px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => remove(s)}
                      className="min-h-[40px] min-w-[40px] rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit modal */}
      {editing && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setEditing(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50 rounded-3xl border border-white/10 bg-[#0f0f16] p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">
                {isNew ? 'تنظیم جدید' : `ویرایش ${editing.key}`}
              </h3>
              <button onClick={() => setEditing(null)} className="text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">کلید *</label>
                <input
                  type="text"
                  value={editing.key}
                  disabled={!isNew}
                  onChange={(e) => setEditing({ ...editing, key: e.target.value })}
                  placeholder="branding.card_number"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white disabled:opacity-50 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">دسته</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setEditing({ ...editing, category: c.key })}
                      className={cn(
                        'min-h-[40px] rounded-xl text-xs font-medium border',
                        editing.category === c.key
                          ? 'bg-purple-500/20 border-purple-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/60',
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">توضیح</label>
                <input
                  type="text"
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">
                  مقدار (JSON یا متن ساده)
                </label>
                <textarea
                  value={typeof editing.value === 'string' ? editing.value : JSON.stringify(editing.value, null, 2)}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  dir="ltr"
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono text-xs resize-none"
                />
              </div>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="w-full mt-5 min-h-[48px] rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" />ذخیره</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
