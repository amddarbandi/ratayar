'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, IdCard, MapPin, Mail, Loader2, Check, X, AlertCircle, Sparkles,
} from 'lucide-react';
import { authApi } from '@/lib/api';
import { JalaliDatePicker } from '@/components/common/jalali-date-picker';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  isValidIranianNationalId,
  isValidIranianPostalCode,
  isValidPersianName,
  isValidEmail,
  toEnglishDigits,
  extractBirthFromNationalId,
} from '@/lib/validation';
import { fromJalali } from '@/lib/jalali';

interface Props {
  open: boolean;
  onClose: () => void;
  onCompleted: () => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  fatherName: string;
  nationalId: string;
  idNumber: string;
  birthDate: string;
  address: string;
  postalCode: string;
  email: string;
}

const EMPTY: FormState = {
  firstName: '',
  lastName: '',
  fatherName: '',
  nationalId: '',
  idNumber: '',
  birthDate: '',
  address: '',
  postalCode: '',
  email: '',
};

export function ProfileCompletionModal({ open, onClose, onCompleted }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load current status once modal opens (for prefill)
  useEffect(() => {
    if (!open) return;
    setLoadingPrefill(true);
    authApi
      .getProfileStatus()
      .then((res) => {
        const p = res.data?.prefilled || {};
        setForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          fatherName: p.fatherName || '',
          nationalId: p.nationalId || '',
          idNumber: p.idNumber || '',
          birthDate: p.birthDate ? p.birthDate.slice(0, 10) : '',
          address: p.address || '',
          postalCode: p.postalCode || '',
          email: p.email || '',
        });
      })
      .catch(() => {
        /* ignore */
      })
      .finally(() => setLoadingPrefill(false));
  }, [open]);

  // Auto-fill birth date when a valid national ID is entered
  useEffect(() => {
    const id = toEnglishDigits(form.nationalId);
    if (isValidIranianNationalId(id) && !form.birthDate) {
      const info = extractBirthFromNationalId(id);
      if (info) {
        const iso = fromJalali(info.year, info.month, info.day).toISOString();
        setForm((f) => ({ ...f, birthDate: iso }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.nationalId]);

  const set = <K extends keyof FormState>(k: K, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  // Per-field validation errors
  const errors: Partial<Record<keyof FormState, string>> = {
    firstName:
      form.firstName && !isValidPersianName(form.firstName)
        ? 'نام فارسی معتبر وارد کنید'
        : '',
    lastName:
      form.lastName && !isValidPersianName(form.lastName)
        ? 'نام خانوادگی فارسی معتبر وارد کنید'
        : '',
    fatherName:
      form.fatherName && !isValidPersianName(form.fatherName)
        ? 'نام پدر فارسی معتبر وارد کنید'
        : '',
    nationalId:
      form.nationalId &&
      !isValidIranianNationalId(toEnglishDigits(form.nationalId))
        ? 'کد ملی معتبر نیست'
        : '',
    idNumber:
      form.idNumber && !/^\d{1,10}$/.test(toEnglishDigits(form.idNumber))
        ? 'شماره شناسنامه معتبر نیست'
        : '',
    birthDate: !form.birthDate ? 'تاریخ تولد الزامی است' : '',
    address:
      form.address && form.address.trim().length < 10
        ? 'آدرس حداقل ۱۰ حرف'
        : '',
    postalCode:
      form.postalCode &&
      !isValidIranianPostalCode(toEnglishDigits(form.postalCode))
        ? 'کد پستی معتبر نیست'
        : '',
    email:
      form.email && !isValidEmail(form.email) ? 'ایمیل معتبر نیست' : '',
  };

  const hasError = Object.values(errors).some(Boolean);
  const allFilled =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.fatherName.trim() &&
    form.nationalId.trim() &&
    form.idNumber.trim() &&
    form.birthDate &&
    form.address.trim().length >= 10 &&
    form.postalCode.trim();

  const canSubmit = !!allFilled && !hasError && !loading;

  const submit = async () => {
    if (!canSubmit) {
      toast.error('لطفاً همه فیلدها را معتبر وارد کنید');
      return;
    }
    setLoading(true);
    try {
      await authApi.completeProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        fatherName: form.fatherName.trim(),
        nationalId: toEnglishDigits(form.nationalId),
        idNumber: toEnglishDigits(form.idNumber),
        birthDate: form.birthDate,
        address: form.address.trim(),
        postalCode: toEnglishDigits(form.postalCode),
        email: form.email.trim() || undefined,
      });
      toast.success('پروفایل شما تکمیل شد 🎉');
      onCompleted();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ذخیره اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            className="fixed inset-x-3 top-1/2 -translate-y-1/2 max-w-2xl mx-auto z-[60] rounded-3xl border border-white/10 bg-[#0f0f16] p-5 md:p-6 max-h-[92vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg md:text-xl">
                    تکمیل پروفایل کاربری
                  </h2>
                  <p className="text-white/50 text-xs mt-1 leading-6">
                    برای استفاده کامل از امکانات پلتفرم و احراز هویت، این
                    اطلاعات را تکمیل کنید.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white/5 text-white/60 hover:text-white"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingPrefill ? (
              <div className="text-center text-white/40 py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                در حال بارگذاری...
              </div>
            ) : (
              <div className="space-y-4">
                {/* Row 1: first + last */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field
                    label="نام"
                    required
                    value={form.firstName}
                    onChange={(v) => set('firstName', v)}
                    onBlur={() => blur('firstName')}
                    error={touched.firstName ? errors.firstName : ''}
                    icon={User}
                    placeholder="مثلاً: علی"
                  />
                  <Field
                    label="نام خانوادگی"
                    required
                    value={form.lastName}
                    onChange={(v) => set('lastName', v)}
                    onBlur={() => blur('lastName')}
                    error={touched.lastName ? errors.lastName : ''}
                    icon={User}
                    placeholder="مثلاً: محمدی"
                  />
                </div>

                {/* Row 2: father name */}
                <Field
                  label="نام پدر"
                  required
                  value={form.fatherName}
                  onChange={(v) => set('fatherName', v)}
                  onBlur={() => blur('fatherName')}
                  error={touched.fatherName ? errors.fatherName : ''}
                  icon={User}
                  placeholder="مثلاً: حسین"
                />

                {/* Row 3: nationalId + idNumber */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field
                    label="کد ملی"
                    required
                    value={form.nationalId}
                    onChange={(v) => set('nationalId', v)}
                    onBlur={() => blur('nationalId')}
                    error={touched.nationalId ? errors.nationalId : ''}
                    icon={IdCard}
                    placeholder="۱۰ رقم"
                    dir="ltr"
                    maxLength={10}
                    hint="با وارد کردن کد ملی، تاریخ تولد خودکار پر می‌شود"
                  />
                  <Field
                    label="شماره شناسنامه"
                    required
                    value={form.idNumber}
                    onChange={(v) => set('idNumber', v)}
                    onBlur={() => blur('idNumber')}
                    error={touched.idNumber ? errors.idNumber : ''}
                    icon={IdCard}
                    placeholder="مثلاً: 1234"
                    dir="ltr"
                    maxLength={10}
                  />
                </div>

                {/* Row 4: birthDate */}
                <JalaliDatePicker
                  label="تاریخ تولد"
                  required
                  value={form.birthDate || null}
                  onChange={(iso) => set('birthDate', iso)}
                />
                {touched.birthDate && errors.birthDate && (
                  <div className="text-rose-400 text-xs -mt-2">
                    {errors.birthDate}
                  </div>
                )}

                {/* Row 5: address */}
                <div>
                  <label className="block text-xs text-white/60 mb-1">
                    آدرس محل سکونت
                    <span className="text-rose-400 mr-1">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute top-3 right-3 w-4 h-4 text-white/30 pointer-events-none" />
                    <textarea
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      onBlur={() => blur('address')}
                      placeholder="استان، شهر، خیابان، پلاک، واحد"
                      rows={2}
                      className={cn(
                        'w-full bg-white/5 border rounded-xl pr-9 pl-3 py-2.5 text-white text-sm resize-none focus:outline-none transition',
                        touched.address && errors.address
                          ? 'border-rose-500/50 focus:border-rose-500'
                          : 'border-white/10 focus:border-cyan-500/50',
                      )}
                    />
                  </div>
                  {touched.address && errors.address && (
                    <div className="text-rose-400 text-xs mt-1">
                      {errors.address}
                    </div>
                  )}
                </div>

                {/* Row 6: postalCode + email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field
                    label="کد پستی"
                    required
                    value={form.postalCode}
                    onChange={(v) => set('postalCode', v)}
                    onBlur={() => blur('postalCode')}
                    error={touched.postalCode ? errors.postalCode : ''}
                    icon={MapPin}
                    placeholder="۱۰ رقم"
                    dir="ltr"
                    maxLength={10}
                  />
                  <Field
                    label="ایمیل (اختیاری)"
                    value={form.email}
                    onChange={(v) => set('email', v)}
                    onBlur={() => blur('email')}
                    error={touched.email ? errors.email : ''}
                    icon={Mail}
                    placeholder="you@example.com"
                    dir="ltr"
                  />
                </div>

                {/* Hint banner */}
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div className="text-white/60 text-xs leading-6">
                    اطلاعات شما فقط برای احراز هویت استفاده می‌شود و نزد ما
                    محفوظ است.
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={submit}
                  disabled={!canSubmit}
                  className="w-full min-h-[52px] rounded-2xl bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      ذخیره و ادامه
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ═══════════════════════════════════════════
// Field — reusable input with label + icon + error
// ═══════════════════════════════════════════

function Field({
  label,
  value,
  onChange,
  onBlur,
  error,
  icon: Icon,
  placeholder,
  required,
  dir,
  maxLength,
  type = 'text',
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  icon?: any;
  placeholder?: string;
  required?: boolean;
  dir?: 'ltr' | 'rtl';
  maxLength?: number;
  type?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1">
        {label}
        {required && <span className="text-rose-400 mr-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute top-3 right-3 w-4 h-4 text-white/30 pointer-events-none" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          dir={dir}
          maxLength={maxLength}
          className={cn(
            'w-full bg-white/5 border rounded-xl py-2.5 text-white text-sm focus:outline-none transition',
            Icon ? 'pr-9 pl-3' : 'px-3',
            error
              ? 'border-rose-500/50 focus:border-rose-500'
              : 'border-white/10 focus:border-cyan-500/50',
          )}
        />
      </div>
      {hint && !error && (
        <div className="text-white/30 text-[11px] mt-1">{hint}</div>
      )}
      {error && (
        <div className="text-rose-400 text-[11px] mt-1">{error}</div>
      )}
    </div>
  );
}
