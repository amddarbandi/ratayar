'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  KeyRound, Plus, Trash2, X, Loader2, Copy, Check, AlertTriangle,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliDateTime } from '@/lib/jalali';

interface KeyRow {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  revokedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const SCOPES = [
  { key: 'read', label: 'خواندن' },
  { key: 'write', label: 'نوشتن' },
  { key: 'admin', label: 'ادمین' },
];

export default function AdminApiKeysPage() {
  const [items, setItems] = useState<KeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>(['read']);
  const [expiresAt, setExpiresAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .listApiKeys()
      .then((res) => setItems(res.data.items))
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleScope = (s: string) => {
    setScopes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const create = async () => {
    if (!name.trim() || name.trim().length < 2) {
      toast.error('نام الزامی است');
      return;
    }
    if (scopes.length === 0) {
      toast.error('حداقل یک دسترسی انتخاب کنید');
      return;
    }
    setSaving(true);
    try {
      const res = await adminApi.createApiKey({
        name: name.trim(),
        scopes,
        expiresAt: expiresAt || undefined,
      });
      setRevealed(res.data.rawKey);
      setName('');
      setScopes(['read']);
      setExpiresAt('');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا');
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (row: KeyRow) => {
    if (!confirm('کلید باطل شود؟')) return;
    try {
      await adminApi.revokeApiKey(row.id);
      toast.success('کلید باطل شد');
      load();
    } catch {
      toast.error('خطا');
    }
  };

  const copyKey = async () => {
    if (!revealed) return;
    try {
      await navigator.clipboard.writeText(revealed);
      setCopied(true);
      toast.success('کپی شد');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('کپی نشد');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setRevealed(null);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              کلیدهای API
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            برای یکپارچه‌سازی خارجی — هر کلید فقط یک بار نمایش داده می‌شود
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          کلید جدید
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
        <Card>
          <CardContent className="p-10 text-center">
            <KeyRound className="w-8 h-8 text-white/30 mx-auto mb-3" />
            <div className="text-white/40 text-sm">
              هیچ کلید API ساخته نشده است.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {items.map((row, i) => {
          const revoked = !!row.revokedAt;
          return (
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
                        <span className="text-white font-medium text-sm">
                          {row.name}
                        </span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/60" dir="ltr">
                          {row.keyPrefix}...
                        </span>
                        {revoked ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-300">
                            باطل شده
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                            فعال
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-1">
                        {row.scopes.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                      <div className="text-white/30 text-[10px]">
                        ساخته شده: {toJalaliDateTime(row.createdAt)}
                      </div>
                    </div>
                    {!revoked && (
                      <button
                        onClick={() => revoke(row)}
                        className="min-h-[40px] min-w-[40px] rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center justify-center"
                        aria-label="باطل کردن"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-50" onClick={closeModal} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto z-50 rounded-3xl border border-white/10 bg-[#0f0f16] p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">
                {revealed ? 'کلید ساخته شد' : 'کلید API جدید'}
              </h3>
              <button onClick={closeModal} className="text-white/40">
                <X className="w-5 h-5" />
              </button>
            </div>

            {revealed ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-white/80 text-xs leading-6">
                    این کلید فقط همین یک بار نمایش داده می‌شود.
                    همین الان کپی و ذخیره کنید.
                  </div>
                </div>

                <div className="relative">
                  <div className="font-mono text-xs text-white bg-black/40 rounded-xl p-3 break-all" dir="ltr">
                    {revealed}
                  </div>
                  <button
                    onClick={copyKey}
                    className="absolute top-2 left-2 p-2 rounded-lg bg-white/10 hover:bg-white/20"
                    aria-label="کپی"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/70" />
                    )}
                  </button>
                </div>

                <button
                  onClick={closeModal}
                  className="w-full min-h-[48px] rounded-xl bg-white/5 border border-white/10 text-white font-medium"
                >
                  بستن
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1">نام *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-2">
                    دسترسی‌ها *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {SCOPES.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => toggleScope(s.key)}
                        className={cn(
                          'min-h-[40px] rounded-xl text-xs font-medium border',
                          scopes.includes(s.key)
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-white'
                            : 'bg-white/5 border-white/10 text-white/60',
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/60 mb-1">
                    انقضا (اختیاری)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    dir="ltr"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm"
                  />
                </div>

                <button
                  onClick={create}
                  disabled={saving}
                  className="w-full mt-4 min-h-[48px] rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ساخت کلید'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
