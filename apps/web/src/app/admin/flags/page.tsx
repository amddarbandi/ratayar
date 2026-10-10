'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flag, Plus, Trash2, Save, X, Loader2 } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FlagRow {
  key: string;
  enabled: boolean;
  description: string | null;
  rolloutPct: number;
  audience: string;
  updatedAt: string;
  createdAt: string;
}

export default function AdminFlagsPage() {
  const [items, setItems] = useState<FlagRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FlagRow | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listFlags()
      .then((res) => setItems(res.data.items))
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing({
      key: '',
      enabled: false,
      description: '',
      rolloutPct: 100,
      audience: 'all',
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
      await adminApi.upsertFlag(editing.key, {
        enabled: editing.enabled,
        description: editing.description || undefined,
        rolloutPct: editing.rolloutPct,
        audience: editing.audience,
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

  const toggle = async (f: FlagRow) => {
    try {
      await adminApi.upsertFlag(f.key, { enabled: !f.enabled });
      load();
    } catch {
      toast.error('خطا');
    }
  };

  const remove = async (f: FlagRow) => {
    if (!confirm(`فلگ «${f.key}» حذف شود؟`)) return;
    try {
      await adminApi.deleteFlag(f.key);
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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              فلگ‌های ویژگی
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            روشن/خاموش کردن قابلیت‌ها برای گروه‌های مختلف
          </p>
        </div>
        <button
          onClick={openNew}
          className="min-h-[44px] px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          فلگ جدید
        </button>
      </div>

      {loading && items.length === 0 && (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center text-white/40">
          هیچ فلگی ثبت نشده است.
        </div>
      )}

      <div className="space-y-2">
        {items.map((f, i) => (
          <motion.div
            key={f.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-white/90">{f.key}</span>
                      <span
                        className={cn(
                          'text-[10px] px-2 py-0.5 rounded-full',
                          f.enabled
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-white/10 text-white/50',
                        )}
                      >
                        {f.enabled ? 'روشن' : 'خاموش'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300">
                        {f.rolloutPct}% — {f.audience}
                      </span>
                    </div>
                    {f.description && (
                      <div className="text-white/50 text-xs">{f.description}</div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggle(f)}
                      className={cn(
                        'min-h-[40px] px-3 rounded-xl border text-xs',
                        f.enabled
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-white/60',
                      )}
                    >
                      {f.enabled ? 'خاموش' : 'روشن'}
                    </button>
                    <button
                      onClick={() => { setEditing(f); setIsNew(false); }}
                      className="min-h-[40px] px-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => remove(f)}
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

      {editing && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={() => setEditing(null)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-50 rounded-3xl border border-white/10 bg-[#0f0f16] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">
                {isNew ? 'فلگ جدید' : `ویرایش ${editing.key}`}
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
                  placeholder="new_dashboard"
                  dir="ltr"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white disabled:opacity-50 font-mono text-sm"
                />
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
                <label className="block text-xs text-white/60 mb-1">مخاطب</label>
                <div className="grid grid-cols-3 gap-2">
                  {['all', 'plan:family', 'plan:business'].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setEditing({ ...editing, audience: a })}
                      className={cn(
                        'min-h-[40px] rounded-xl text-xs font-medium border',
                        editing.audience === a
                          ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                          : 'bg-white/5 border-white/10 text-white/60',
                      )}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">
                  درصد پخش — {editing.rolloutPct}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={editing.rolloutPct}
                  onChange={(e) =>
                    setEditing({ ...editing, rolloutPct: Number(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
              <label className="flex items-center gap-2 min-h-[44px]">
                <input
                  type="checkbox"
                  checked={editing.enabled}
                  onChange={(e) => setEditing({ ...editing, enabled: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-white/80 text-sm">روشن باشد</span>
              </label>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="w-full mt-4 min-h-[48px] rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" />ذخیره</>}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
