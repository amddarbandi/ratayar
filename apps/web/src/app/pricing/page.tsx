'use client';

import { useEffect, useState } from 'react';
import { plansApi } from '@/lib/api';
import { PlanCard } from '@/components/plans/plan-card';

interface Plan {
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
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    plansApi
      .list()
      .then((res) => setPlans(res.data))
      .catch((e: any) => setError(e.message || 'خطا در بارگذاری'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            پلن‌های راتایار
          </h1>
          <p className="text-lg text-white/60">
            پلنی را انتخاب کنید که با نیاز شما هماهنگ است
          </p>
        </div>

        {loading && (
          <div className="text-center text-white/40">در حال بارگذاری...</div>
        )}
        {error && <div className="text-center text-red-400">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
