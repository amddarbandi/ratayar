'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Send, X, Loader2, MessageSquare, AlertCircle,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onClose: () => void;
  userId: string;
  userLabel: string;
}

const CATEGORIES = [
  { key: 'system', label: 'سیستمی' },
  { key: 'support', label: 'پشتیبانی' },
  { key: 'billing', label: 'پرداخت' },
  { key: 'announcement', label: 'اطلاعیه' },
];

const PRIORITIES = [
  { key: 'normal', label: 'عادی', cls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  { key: 'important', label: 'مهم', cls: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { key: 'critical', label: 'فوری', cls: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
];

export function DirectMessageModal({ open, onClose, userId, userLabel }: Props) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');
  const [sendSms, setSendSms] = useState(false);
  const [sending, setSending] = useState(false);

  const reset = () => {
    setTitle('');
    setBody('');
    setPriority('normal');
    setSendSms(false);
  };

  const send = async () => {
    if (!title.trim() || title.trim().length < 3) {
      toast.error('عنوان حداقل ۳ حرف');
      return;
    }
    if (!body.trim() || body.trim().length < 5) {
      toast.error('متن حداقل ۵ حرف');
      return;
    }

    setSending(true);
    try {
      // Use Broadcast backend with a single-user audience
      await adminApi.createBroadcast({
        channel: sendSms ? 'sms' : 'in_app',
        audience: 'users',
        audienceMeta: { userIds: [userId] },
        title: title.trim(),
        body: body.trim(),
        priority,
      });
      toast.success('پیام ارسال شد');
      reset();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا در ارسال');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    reset();
    onClose();
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
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            className="fixed inset-x-3 top-1/2 -translate-y-1/2 max-w-lg mx-auto z-[60] rounded-3xl border border-white/10 bg-[#0f0f16] p-5 md:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base md:text-lg">
                    ارسال پیام مستقیم
                  </h2>
                  <p className="text-white/50 text-xs mt-1">
                    به {userLabel}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={sending}
                className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-xl bg-white/5 text-white/60 hover:text-white disabled:opacity-40"
                aria-label="بستن"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs text-white/60 mb-1">
                  عنوان <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثلاً: به‌روزرسانی حساب کاربری"
                  disabled={sending}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs text-white/60 mb-1">
                  متن پیام <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="متن کامل پیام..."
                  disabled={sending}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs text-white/60 mb-2">اولویت</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPriority(p.key)}
                      disabled={sending}
                      className={cn(
                        'min-h-[40px] rounded-xl text-xs font-medium border transition-all disabled:opacity-50',
                        priority === p.key
                          ? p.cls
                          : 'bg-white/5 border-white/10 text-white/60',
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SMS toggle */}
              <label className="flex items-center gap-2 min-h-[44px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSms}
                  onChange={(e) => setSendSms(e.target.checked)}
                  disabled={sending}
                  className="w-4 h-4 disabled:opacity-50"
                />
                <span className="text-white/80 text-sm">
                  ارسال از طریق پیامک (SMS)
                </span>
              </label>

              {/* Info */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-white/60 text-[11px] leading-6">
                  {sendSms
                    ? 'با انتخاب پیامک، هزینه SMS از اعتبار پلتفرم کسر می‌شود. در صورت نبود اعتبار، پیام در اپ نمایش داده می‌شود.'
                    : 'پیام در بخش اعلان‌های کاربر نمایش داده می‌شود.'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={send}
                disabled={sending || !title.trim() || !body.trim()}
                className="flex-1 min-h-[48px] rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    ارسال
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={sending}
                className="min-h-[48px] px-5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white disabled:opacity-40"
              >
                انصراف
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
