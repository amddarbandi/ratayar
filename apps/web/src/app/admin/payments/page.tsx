'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { paymentApi, adminApi } from '@/lib/api';
import { Check, X, ExternalLink, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Payment {
  id: string;
  amount: string;
  method: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded';
  receiptKey: string;
  receiptMime?: string;
  trackingCode?: string;
  adminNote?: string;
  reviewedAt?: string;
  createdAt: string;
  plan: { id: string; code: string; name: string };
  user?: { id: string; phone: string; fullName?: string };
}

function Content() {
  const params = useSearchParams();
  const statusFilter = params.get('status') || 'pending';

  const [items, setItems] = useState<Payment[]>([]);
  const [status, setStatus] = useState(statusFilter);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    id: string;
    action: 'approve' | 'reject';
  } | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [refunding, setRefunding] = useState<string | null>(null);

  const load = (s?: string) => {
    setLoading(true);
    paymentApi
      .adminAll(s || status)
      .then((res) => setItems(res.data))
      .catch(() => setError('خطا در بارگذاری پرداخت‌ها'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load(status);
  }, [status]);

  const doReview = async () => {
    if (!modal) return;
    setReviewing(modal.id);
    setError('');
    try {
      if (modal.action === 'approve') {
        await paymentApi.adminApprove(modal.id, note || undefined);
      } else {
        await paymentApi.adminReject(modal.id, note || undefined);
      }
      setModal(null);
      setNote('');
      load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'خطا در بررسی');
    } finally {
      setReviewing(null);
    }
  };

  const doRefund = async (p: Payment) => {
    const reason = prompt('دلیل بازگشت پرداخت (اختیاری):') || '';
    if (!confirm(`مبلغ ${Number(p.amount).toLocaleString('fa-IR')} تومان بازگشت داده شود؟`)) return;
    setRefunding(p.id);
    try {
      await adminApi.refundPayment(p.id, reason);
      toast.success('پرداخت بازگشت داده شد');
      load();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'خطا');
    } finally {
      setRefunding(null);
    }
  };

  const statusTabs = [
    { key: 'pending', label: 'در انتظار' },
    { key: 'approved', label: 'تأیید شده' },
    { key: 'rejected', label: 'رد شده' },
  ];

  const getReceiptUrl = (p: Payment) => {
    // presigned could be added later; for now show raw key
    return p.receiptKey;
  };

  return (
    <div dir="rtl">
      <h1 className="text-3xl font-bold text-white mb-6">درخواست‌های پرداخت</h1>

      <div className="flex gap-2 mb-6">
        {statusTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              status === t.key
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {loading && <div className="text-white/40">در حال بارگذاری...</div>}

      {!loading && items.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/50">
          موردی یافت نشد.
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-white font-bold text-lg">
                    پلن {p.plan.name}
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    {p.user?.fullName || '—'} •{' '}
                    <span dir="ltr" className="font-mono">
                      {p.user?.phone}
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-white">
                    {Number(p.amount).toLocaleString('fa-IR')}
                  </div>
                  <div className="text-xs text-white/40">تومان</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-white/60 mb-4">
                <div>روش: {p.method}</div>
                <div>کد پیگیری: {p.trackingCode || '—'}</div>
                <div>
                  تاریخ: {new Date(p.createdAt).toLocaleString('fa-IR')}
                </div>
                {p.reviewedAt && (
                  <div>
                    بررسی: {new Date(p.reviewedAt).toLocaleString('fa-IR')}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <a
                  href={`/api/documents/${p.receiptKey}/stream`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-3 h-3" />
                  مشاهده رسید ({p.receiptMime || 'فایل'})
                </a>
              </div>

              {p.status === 'pending' ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setModal({ id: p.id, action: 'approve' })}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4" />
                    تأیید
                  </button>
                  <button
                    onClick={() => setModal({ id: p.id, action: 'reject' })}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <X className="w-4 h-4" />
                    رد
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-sm">
                    {p.status === 'approved' ? (
                      <span className="text-green-400">✅ تأیید شده</span>
                    ) : p.status === 'refunded' ? (
                      <span className="text-amber-400">↩️ بازگشت داده شده</span>
                    ) : (
                      <span className="text-red-400">❌ رد شده</span>
                    )}
                    {p.adminNote && (
                      <span className="text-white/50 mr-3 text-xs">
                        یادداشت: {p.adminNote}
                      </span>
                    )}
                  </div>
                  {p.status === 'approved' && (
                    <button
                      onClick={() => doRefund(p)}
                      disabled={refunding === p.id}
                      className="min-h-[40px] px-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RotateCcw className={cn('w-3.5 h-3.5', refunding === p.id && 'animate-spin')} />
                      بازگشت پرداخت
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setModal(null)}
        >
          <div
            className="bg-[#15151d] border border-white/10 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-white mb-4">
              {modal.action === 'approve'
                ? 'تأیید پرداخت'
                : 'رد پرداخت'}
            </h2>
            <p className="text-white/60 text-sm mb-4">
              {modal.action === 'approve'
                ? 'پس از تأیید، اشتراک کاربر به‌طور خودکار فعال می‌شود و تیکت بسته خواهد شد.'
                : 'دلیل رد را بنویسید (اختیاری ولی توصیه می‌شود).'}
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white h-24 mb-4"
              placeholder={
                modal.action === 'approve'
                  ? 'یادداشت (اختیاری)'
                  : 'دلیل رد'
              }
            />

            <div className="flex gap-3">
              <button
                onClick={doReview}
                disabled={reviewing !== null}
                className={`flex-1 py-2 rounded-lg text-white ${
                  modal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {reviewing ? 'در حال بررسی...' : 'تأیید نهایی'}
              </button>
              <button
                onClick={() => setModal(null)}
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

export default function AdminPaymentsPage() {
  return (
    <Suspense fallback={<div className="text-white/40">بارگذاری...</div>}>
      <Content />
    </Suspense>
  );
}
