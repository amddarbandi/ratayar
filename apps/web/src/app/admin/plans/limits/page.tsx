'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2, Save, RotateCcw, Check, AlertTriangle,
  Users, ListChecks, Package, FileText, HardDrive, Upload,
} from 'lucide-react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { fmtStorageMB, fmtNum } from '@/lib/format';

interface Plan {
  id: string;
  code: string;
  name: string;
  priceMonthly: string;
  maxMembers: number;
  maxObligations: number;
  maxAssets: number;
  maxDocuments: number;
  maxStorageMB: number;
  maxUploadMB: number;
  allowedFormats: string[];
  isActive: boolean;
  sortOrder: number;
}

const FIELDS: Array<{
  key: keyof Pick<
    Plan,
    | 'maxMembers'
    | 'maxObligations'
    | 'maxAssets'
    | 'maxDocuments'
    | 'maxStorageMB'
    | 'maxUploadMB'
  >;
  label: string;
  icon: any;
  unit?: string;
  hint?: string;
}> = [
  { key: 'maxMembers', label: 'کاربران', icon: Users, hint: '-1 = بی‌نهایت' },
  { key: 'maxObligations', label: 'تعهدات', icon: ListChecks },
  { key: 'maxAssets', label: 'دارایی‌ها', icon: Package },
  { key: 'maxDocuments', label: 'اسناد', icon: FileText },
  { key: 'maxStorageMB', label: 'فضا', icon: HardDrive, unit: 'MB' },
  { key: 'maxUploadMB', label: 'آپلود', icon: Upload, unit: 'MB' },
];

export default function PlanLimitsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [edits, setEdits] = useState<Record<string, Partial<Plan>>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .get('/plans/admin/all')
      .then((res) => setPlans(res.data))
      .catch(() => toast.error('خطا در بارگذاری پلن‌ها'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const setEdit = (planId: string, field: keyof Plan, value: any) => {
    setEdits((prev) => ({
      ...prev,
      [planId]: { ...(prev[planId] || {}), [field]: value },
    }));
  };

  const resetEdits = (planId: string) => {
    setEdits((prev) => {
      const next = { ...prev };
      delete next[planId];
      return next;
    });
  };

  const save = async (planId: string) => {
    const delta = edits[planId];
    if (!delta) return;
    setSaving(planId);
    try {
      await api.patch(`/plans/${planId}`, delta);
      toast.success('ذخیره شد');
      resetEdits(planId);
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ذخیره');
    } finally {
      setSaving(null);
    }
  };

  const hasEdits = (planId: string) => !!edits[planId];

  // Sort by sortOrder so plans appear in expected sequence
  const sorted = useMemo(
    () => [...plans].sort((a, b) => a.sortOrder - b.sortOrder),
    [plans],
  );

  const value = (plan: Plan, field: keyof Plan): number => {
    const e = edits[plan.id];
    if (e && field in e) return Number((e as any)[field]);
    return Number((plan as any)[field]);
  };

  const totalDirty = Object.keys(edits).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              محدودیت پلن‌ها
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            تغییر محدودیت‌ها بدون نیاز به دست‌زدن به کد یا دیتابیس
          </p>
        </div>
        {totalDirty > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-xs">
            <AlertTriangle className="w-4 h-4" />
            {fmtNum(totalDirty)} پلن تغییرات ذخیره‌نشده دارد
          </div>
        )}
      </div>

      {loading && plans.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sorted.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <PlanCard
                plan={plan}
                edits={edits[plan.id]}
                value={(field) => value(plan, field)}
                setEdit={(field, v) => setEdit(plan.id, field, v)}
                resetEdits={() => resetEdits(plan.id)}
                save={() => save(plan.id)}
                saving={saving === plan.id}
                dirty={hasEdits(plan.id)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// PlanCard — limits for one plan
// ═══════════════════════════════════════════

function PlanCard({
  plan,
  edits,
  value,
  setEdit,
  resetEdits,
  save,
  saving,
  dirty,
}: {
  plan: Plan;
  edits?: Partial<Plan>;
  value: (field: keyof Plan) => number;
  setEdit: (field: keyof Plan, v: any) => void;
  resetEdits: () => void;
  save: () => void;
  saving: boolean;
  dirty: boolean;
}) {
  return (
    <Card
      className={cn(
        'transition-colors',
        dirty ? 'border-amber-500/40' : 'border-white/10',
      )}
    >
      <CardContent className="p-5 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-white font-bold text-lg truncate">
              {plan.name}
            </div>
            <div className="text-white/50 text-xs mt-0.5 font-mono">
              {plan.code}
            </div>
          </div>
          <div className="text-left flex-shrink-0">
            <div className="text-white font-bold text-sm">
              {Number(plan.priceMonthly).toLocaleString('fa-IR')}
            </div>
            <div className="text-white/40 text-[11px]">تومان / ماه</div>
          </div>
        </div>

        {dirty && (
          <div className="text-amber-300 text-[11px] flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3" />
            تغییرات ذخیره‌نشده
          </div>
        )}

        {/* Limits grid */}
        <div className="space-y-2">
          {FIELDS.map((f) => {
            const v = value(f.key);
            const isUnlimited = v === -1;
            const edited = edits && f.key in edits;

            return (
              <div
                key={f.key}
                className="flex items-center justify-between gap-3 min-h-[44px] px-2 rounded-xl hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <f.icon className="w-4 h-4 text-white/40" />
                  <span className="text-white/80 text-sm">{f.label}</span>
                  {edited && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={v}
                    onChange={(e) =>
                      setEdit(f.key, parseInt(e.target.value, 10) || 0)
                    }
                    dir="ltr"
                    className={cn(
                      'w-24 bg-white/5 border rounded-lg px-2 py-1.5 text-white text-sm text-left font-mono focus:outline-none transition-colors',
                      edited
                        ? 'border-amber-500/50 focus:border-amber-500'
                        : 'border-white/10 focus:border-cyan-500/50',
                    )}
                  />
                  {f.unit && (
                    <span className="text-white/40 text-[11px] w-6">
                      {f.unit}
                    </span>
                  )}
                  {isUnlimited && (
                    <span className="text-emerald-400 text-xs font-bold">
                      ∞
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-white/5">
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="flex-1 min-h-[44px] rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                ذخیره
              </>
            )}
          </button>
          {dirty && (
            <button
              onClick={resetEdits}
              disabled={saving}
              className="min-h-[44px] px-4 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white text-sm flex items-center gap-2 disabled:opacity-40"
            >
              <RotateCcw className="w-4 h-4" />
              انصراف
            </button>
          )}
        </div>

        {/* Footer hint */}
        <div className="text-[11px] text-white/30 text-center">
          عدد -1 = نامحدود
        </div>
      </CardContent>
    </Card>
  );
}
