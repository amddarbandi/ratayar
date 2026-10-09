'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight, User, CreditCard, MessageSquare, FileText, HardDrive,
  ListChecks, Package, Shield, Ban, CheckCircle, Loader2,
} from 'lucide-react';
import { adminApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toJalaliString, toJalaliDateTime } from '@/lib/jalali';

interface Detail {
  user: {
    id: string;
    phone: string;
    fullName: string | null;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  subscription: null | {
    status: string;
    startedAt: string;
    expiresAt: string | null;
    plan: {
      code: string;
      name: string;
      priceMonthly: string;
      maxObligations: number;
      maxDocuments: number;
      maxStorageMB: number;
    };
  };
  payments: {
    id: string;
    amount: string;
    status: string;
    method: string;
    planCode: string;
    planName: string;
    createdAt: string;
    reviewedAt: string | null;
  }[];
  tickets: {
    id: string;
    subject: string;
    status: string;
    category: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
  }[];
  usage: {
    documents: number;
    storageBytes: number;
    storageMB: number;
    obligations: number;
    assets: number;
  };
  recentAudit: any[];
}

const STATUS_MAP: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-300',
  banned: 'bg-red-500/20 text-red-300',
  pending: 'bg-amber-500/20 text-amber-300',
};

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  const load = () => {
    setLoading(true);
    adminApi
      .getUser(id)
      .then((res) => setData(res.data))
      .catch(() => toast.error('خطا در بارگذاری'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const toggleBan = async () => {
    if (!data) return;
    const isBanned = data.user.status === 'banned';
    if (
      !confirm(
        isBanned
          ? 'کاربر از مسدودیت خارج شود؟'
          : 'کاربر مسدود شود؟ این کار دسترسی او را قطع می‌کند.',
      )
    )
      return;
    setActing(true);
    try {
      if (isBanned) await adminApi.unbanUser(id);
      else await adminApi.banUser(id);
      toast.success(isBanned ? 'رفع مسدودیت انجام شد' : 'کاربر مسدود شد');
      load();
    } catch {
      toast.error('خطا در تغییر وضعیت');
    } finally {
      setActing(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-white/40">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
        در حال بارگذاری...
      </div>
    );
  if (!data) return null;

  const u = data.user;
  const isBanned = u.status === 'banned';

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"
      >
        <ArrowRight className="w-4 h-4" />
        بازگشت به کاربران
      </Link>

      {/* Header */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-xl md:text-2xl font-bold flex-shrink-0">
              {u.fullName?.charAt(0) || <User className="w-6 h-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  {u.fullName || 'بدون نام'}
                </h1>
                <span
                  className={cn(
                    'text-[11px] px-2 py-0.5 rounded-full',
                    STATUS_MAP[u.status] || STATUS_MAP.active,
                  )}
                >
                  {u.status}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                  {u.role}
                </span>
              </div>
              <div className="text-white/50 text-sm font-mono" dir="ltr">
                {u.phone}
              </div>
              <div className="text-white/40 text-xs mt-1">
                عضویت از {toJalaliString(u.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-5 flex-wrap">
            <button
              onClick={toggleBan}
              disabled={acting}
              className={cn(
                'min-h-[44px] px-4 rounded-xl flex items-center gap-2 text-sm font-medium disabled:opacity-50',
                isBanned
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300',
              )}
            >
              {isBanned ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  رفع مسدودیت
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  مسدود کردن
                </>
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-white">اشتراک</h2>
          </div>
          {data.subscription ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Cell label="پلن" value={data.subscription.plan.name} />
              <Cell label="وضعیت" value={data.subscription.status} />
              <Cell
                label="شروع"
                value={toJalaliString(data.subscription.startedAt)}
              />
              <Cell
                label="انقضا"
                value={
                  data.subscription.expiresAt
                    ? toJalaliString(data.subscription.expiresAt)
                    : 'بدون انقضا'
                }
              />
            </div>
          ) : (
            <div className="text-white/40 text-sm">
              اشتراک فعالی ندارد (روی پلن رایگان است).
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white">مصرف</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Cell label="اسناد" value={data.usage.documents.toLocaleString('fa-IR')} icon={FileText} />
            <Cell label="فضا" value={`${data.usage.storageMB} MB`} icon={HardDrive} />
            <Cell label="تعهدات" value={data.usage.obligations.toLocaleString('fa-IR')} icon={ListChecks} />
            <Cell label="دارایی‌ها" value={data.usage.assets.toLocaleString('fa-IR')} icon={Package} />
            <Cell label="تیکت‌ها" value={data.tickets.length.toLocaleString('fa-IR')} icon={MessageSquare} />
          </div>
        </CardContent>
      </Card>

      {/* Recent payments */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-white">
              آخرین پرداخت‌ها ({data.payments.length})
            </h2>
          </div>
          {data.payments.length === 0 ? (
            <div className="text-white/40 text-sm">پرداختی ثبت نشده.</div>
          ) : (
            <div className="space-y-2">
              {data.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 p-3 text-sm"
                >
                  <div>
                    <div className="text-white">پلن {p.planName}</div>
                    <div className="text-white/40 text-xs">
                      {toJalaliString(p.createdAt)}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold">
                      {Number(p.amount).toLocaleString('fa-IR')}
                    </div>
                    <div className="text-white/40 text-xs">{p.status}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent tickets */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white">
              آخرین تیکت‌ها ({data.tickets.length})
            </h2>
          </div>
          {data.tickets.length === 0 ? (
            <div className="text-white/40 text-sm">تیکتی ثبت نشده.</div>
          ) : (
            <div className="space-y-2">
              {data.tickets.map((t) => (
                <Link
                  key={t.id}
                  href={`/admin/tickets/${t.id}`}
                  className="block rounded-xl border border-white/5 p-3 text-sm hover:bg-white/5 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white truncate">{t.subject}</span>
                    <span className="text-white/40 text-xs whitespace-nowrap mr-2">
                      {t.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent audit */}
      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-fuchsia-400" />
            <h2 className="font-bold text-white">
              اقدامات این کاربر ({data.recentAudit.length})
            </h2>
          </div>
          {data.recentAudit.length === 0 ? (
            <div className="text-white/40 text-sm">اقدامی ثبت نشده.</div>
          ) : (
            <div className="space-y-2">
              {data.recentAudit.map((a: any) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-xs py-2 border-b border-white/5 last:border-0"
                >
                  <span className="text-white/80 font-mono">{a.action}</span>
                  <span className="text-white/40">
                    {toJalaliDateTime(a.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Cell({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: any;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center gap-1.5 text-white/40 text-[11px] mb-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </div>
      <div className="text-white font-bold text-sm">{value}</div>
    </div>
  );
}
