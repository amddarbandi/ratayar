'use client';
import { fmtStorageMB } from '@/lib/format';

import { useEffect, useState } from 'react';
import { plansApi, api } from '@/lib/api';
import { Pencil, Trash2, Plus, X } from 'lucide-react';

interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string;
  priceMonthly: string;
  priceYearly?: string;
  maxMembers: number;
  maxObligations: number;
  maxAssets: number;
  maxDocuments: number;
  maxStorageMB: number;
  maxUploadMB: number;
  allowedFormats: string[];
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

const EMPTY: Partial<Plan> = {
  code: '',
  name: '',
  description: '',
  priceMonthly: '0',
  maxMembers: 1,
  maxObligations: 5,
  maxAssets: 5,
  maxDocuments: 5,
  maxStorageMB: 50,
  maxUploadMB: 2,
  allowedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'docx', 'xlsx'],
  isActive: true,
  isPopular: false,
  sortOrder: 0,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Plan> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/plans/admin/all')
      .then((res) => setPlans(res.data))
      .catch(() => setError('خطا در بارگذاری پلن‌ها'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => {
    setEditing({ ...EMPTY });
    setIsNew(true);
    setError('');
  };

  const openEdit = (p: Plan) => {
    setEditing({ ...p });
    setIsNew(false);
    setError('');
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...editing,
        priceMonthly: String(editing.priceMonthly || '0'),
        priceYearly: editing.priceYearly
          ? String(editing.priceYearly)
          : undefined,
      };
      if (isNew) {
        await api.post('/plans', payload);
      } else {
        await api.patch(`/plans/${editing.id}`, payload);
      }
      setEditing(null);
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در ذخیره');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('این پلن غیرفعال شود؟')) return;
    try {
      await api.delete(`/plans/${id}`);
      load();
    } catch {
      setError('خطا در حذف');
    }
  };

  const set = <K extends keyof Plan>(key: K, value: any) =>
    setEditing((e) => ({ ...e!, [key]: value }));

  const fmt = (n: number | undefined) =>
    n === -1 ? '∞' : (n ?? 0).toLocaleString('fa-IR');

  return (
    <div dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">مدیریت پلن‌ها</h1>
        <button
          onClick={openNew}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          پلن جدید
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && <div className="text-white/40">در حال بارگذاری...</div>}

      {!loading && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/60">
              <tr>
                <th className="p-3 text-right">کد</th>
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">قیمت ماهانه</th>
                <th className="p-3 text-right">کاربران</th>
                <th className="p-3 text-right">تعهدات</th>
                <th className="p-3 text-right">اسناد</th>
                <th className="p-3 text-right">فضا</th>
                <th className="p-3 text-right">وضعیت</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody className="text-white/80">
              {plans.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-white/5 hover:bg-white/5"
                >
                  <td className="p-3 font-mono text-xs">{p.code}</td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3">
                    {Number(p.priceMonthly).toLocaleString('fa-IR')}
                  </td>
                  <td className="p-3">{fmt(p.maxMembers)}</td>
                  <td className="p-3">{fmt(p.maxObligations)}</td>
                  <td className="p-3">{fmt(p.maxDocuments)}</td>
                  <td className="p-3">
                    {fmtStorageMB(p.maxStorageMB)}
                  </td>
                  <td className="p-3">
                    {p.isActive ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                        فعال
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-400">
                        غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => openEdit(p)}
                      className="text-white/60 hover:text-white p-2"
                      title="ویرایش"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(p.id)}
                      className="text-red-400/60 hover:text-red-400 p-2"
                      title="غیرفعال کردن"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {editing && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="bg-[#15151d] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {isNew ? 'پلن جدید' : `ویرایش «${editing.name}»`}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">کد</label>
                <input
                  type="text"
                  value={editing.code || ''}
                  onChange={(e) => set('code', e.target.value)}
                  disabled={!isNew}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white disabled:opacity-50"
                  placeholder="free / personal / family / business"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">نام</label>
                <input
                  type="text"
                  value={editing.name || ''}
                  onChange={(e) => set('name', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                  placeholder="رایگان / شخصی / ..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-white/60 mb-1">
                  توضیح
                </label>
                <textarea
                  value={editing.description || ''}
                  onChange={(e) => set('description', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white h-16"
                />
              </div>

              <NumField
                label="قیمت ماهانه (تومان)"
                value={editing.priceMonthly}
                onChange={(v) => set('priceMonthly', v)}
              />
              <NumField
                label="قیمت سالانه (اختیاری)"
                value={editing.priceYearly}
                onChange={(v) => set('priceYearly', v)}
              />
              <NumField
                label="حداکثر کاربران (-1 = بی‌نهایت)"
                value={editing.maxMembers}
                onChange={(v) => set('maxMembers', v)}
              />
              <NumField
                label="حداکثر تعهدات (-1 = بی‌نهایت)"
                value={editing.maxObligations}
                onChange={(v) => set('maxObligations', v)}
              />
              <NumField
                label="حداکثر دارایی‌ها (-1 = بی‌نهایت)"
                value={editing.maxAssets}
                onChange={(v) => set('maxAssets', v)}
              />
              <NumField
                label="حداکثر اسناد (-1 = بی‌نهایت)"
                value={editing.maxDocuments}
                onChange={(v) => set('maxDocuments', v)}
              />
              <NumField
                label="فضا (MB)"
                value={editing.maxStorageMB}
                onChange={(v) => set('maxStorageMB', v)}
              />
              <NumField
                label="حداکثر آپلود (MB)"
                value={editing.maxUploadMB}
                onChange={(v) => set('maxUploadMB', v)}
              />
              <NumField
                label="ترتیب نمایش"
                value={editing.sortOrder}
                onChange={(v) => set('sortOrder', v)}
              />

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editing.isActive ?? true}
                  onChange={(e) => set('isActive', e.target.checked)}
                />
                <label htmlFor="isActive" className="text-sm text-white/80">
                  فعال
                </label>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={editing.isPopular ?? false}
                  onChange={(e) => set('isPopular', e.target.checked)}
                />
                <label htmlFor="isPopular" className="text-sm text-white/80">
                  محبوب‌ترین
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-white/60 mb-1">
                  فرمت‌های مجاز (با ویرگول)
                </label>
                <input
                  type="text"
                  value={(editing.allowedFormats || []).join(', ')}
                  onChange={(e) =>
                    set(
                      'allowedFormats',
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
                  placeholder="pdf, jpg, png, docx"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mt-4 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={save}
                disabled={saving}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium"
              >
                {saving ? 'در حال ذخیره...' : 'ذخیره'}
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-6 bg-white/5 hover:bg-white/10 text-white rounded-lg"
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1">{label}</label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-white"
      />
    </div>
  );
}
