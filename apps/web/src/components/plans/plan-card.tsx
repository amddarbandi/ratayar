import { fmtStorageMB } from '@/lib/format';
import { useRouter } from 'next/navigation';

interface PlanCardProps {
  plan: {
    id: string;
    code: string;
    name: string;
    description?: string;
    priceMonthly: string;
    maxMembers: number;
    maxObligations: number;
    maxAssets: number;
    maxDocuments: number;
    maxStorageMB: number;
    maxUploadMB: number;
    allowedFormats: string[];
    isPopular?: boolean;
  };
}

export function PlanCard({ plan }: PlanCardProps) {
  const router = useRouter();
  const fmtNum = (n: number) =>
    n === -1 ? 'بی‌نهایت' : n.toLocaleString('fa-IR');

  const fmtPrice = (p: string) => {
    const n = Number(p);
    if (n === 0) return 'رایگان';
    return `${n.toLocaleString('fa-IR')} تومان / ماه`;
  };



  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border-2 ${
        plan.isPopular ? 'border-blue-500' : 'border-gray-200'
      } p-6 relative`}
    >
      {plan.isPopular && (
        <span className="absolute -top-3 right-1/2 translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
          پیشنهاد ویژه
        </span>
      )}
      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
      <p className="text-sm text-gray-500 mb-4 h-10">{plan.description || ''}</p>
      <div className="text-2xl font-bold text-blue-600 mb-6">
        {fmtPrice(plan.priceMonthly)}
      </div>
      <ul className="space-y-3 text-sm text-gray-700 mb-6">
        <li>👥 {fmtNum(plan.maxMembers)} کاربر</li>
        <li>📋 {fmtNum(plan.maxObligations)} تعهد</li>
        <li>🏠 {fmtNum(plan.maxAssets)} دارایی</li>
        <li>📄 {fmtNum(plan.maxDocuments)} سند</li>
        <li>💾 {fmtStorageMB(plan.maxStorageMB)} فضا</li>
        <li>⬆️ هر فایل {plan.maxUploadMB} MB</li>
      </ul>
      <button
        onClick={() => router.push(`/dashboard/upgrade?plan=${plan.code}`)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
      >
        {plan.code === 'free' ? 'شروع رایگان' : 'انتخاب و ارتقا'}
      </button>
    </div>
  );
}
