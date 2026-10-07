'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, TrendingUp, TrendingDown, Plus, Trash2,
  ArrowUpRight, ArrowDownRight, Loader2, X, DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from 'recharts';
import { financeApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns-jalali';

const COLORS = ['#a855f7', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

const categoryLabels: any = {
  salary: 'حقوق',
  food: 'خورد و خوراک',
  transport: 'حمل و نقل',
  housing: 'مسکن',
  health: 'سلامت',
  education: 'آموزش',
  entertainment: 'تفریح',
  shopping: 'خرید',
  bills: 'قبوض',
  other: 'سایر',
};

const formatPrice = (price: number) => {
  if (!price) return '۰';
  if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)} میلیارد`;
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)} میلیون`;
  if (price >= 1_000) return `${(price / 1_000).toFixed(0)} هزار`;
  return `${price}`;
};

export default function FinancePage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');

  // Queries
  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['finance-stats'],
    queryFn: () => financeApi.getStats('month'),
  });

  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ['finance-chart'],
    queryFn: () => financeApi.getChart(6),
  });

  const { data: transactionsData, isLoading: loadingTx } = useQuery({
    queryKey: ['finance-transactions'],
    queryFn: () => financeApi.getTransactions(),
  });

  const stats = statsData?.data || { income: 0, expense: 0, balance: 0, count: 0, byCategory: {} };
  const chart = chartData?.data || [];
  const transactions = transactionsData?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => financeApi.deleteTransaction(id),
    onSuccess: () => {
      toast.success('تراکنش حذف شد');
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['finance-chart'] });
    },
  });

  const pieData: Array<{ name: string; value: number }> = Object.entries(
    stats.byCategory || {},
  ).map(([key, value]) => ({
    name: categoryLabels[key] || key,
    value: Number(value) || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">مالی</h1>
          <p className="text-white/50">مدیریت درآمد و هزینه‌ها</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-medium transition-all shadow-lg shadow-purple-500/30 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          تراکنش جدید
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{formatPrice(stats.income)}</div>
                <div className="text-white/50 text-sm">درآمد این ماه</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <ArrowDownRight className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{formatPrice(stats.expense)}</div>
                <div className="text-white/50 text-sm">هزینه این ماه</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                'w-12 h-12 rounded-2xl flex items-center justify-center',
                stats.balance >= 0
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                  : 'bg-gradient-to-br from-orange-500 to-red-500',
              )}>
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className={cn(
                  'text-2xl font-bold',
                  stats.balance >= 0 ? 'text-emerald-400' : 'text-red-400',
                )}>
                  {formatPrice(Math.abs(stats.balance))}
                </div>
                <div className="text-white/50 text-sm">مانده</div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-white mb-6">روند ۶ ماه گذشته</h2>
              {loadingChart ? (
                <div className="h-64 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                </div>
              ) : (
                <div style={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chart}>
                      <defs>
                        <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={12} />
                      <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => formatPrice(v)} />
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(10,10,15,0.95)',
                          border: '1px solid rgba(168,85,247,0.3)',
                          borderRadius: '12px',
                          color: 'white',
                          direction: 'rtl',
                        }}
                        formatter={(value) => [formatPrice(Number(value) || 0), '']}
                      />
                      <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-bold text-white mb-6">هزینه‌ها بر اساس دسته</h2>
              {pieData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-white/30 text-sm">
                  هنوز هزینه‌ای ثبت نشده
                </div>
              ) : (
                <div style={{ direction: 'ltr' }}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'rgba(10,10,15,0.95)',
                          border: '1px solid rgba(168,85,247,0.3)',
                          borderRadius: '12px',
                          color: 'white',
                          direction: 'rtl',
                        }}
                        formatter={(value) => [formatPrice(Number(value) || 0), '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-4" dir="rtl">
                    {pieData.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                          <span className="text-white/70">{item.name}</span>
                        </div>
                        <span className="text-white font-medium">{formatPrice(Number(item.value) || 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-bold text-white mb-6">آخرین تراکنش‌ها</h2>
          {loadingTx ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white/30" />
              </div>
              <p className="text-white/40 text-sm">هنوز تراکنشی ثبت نشده</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 8).map((tx: any, i: number) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10',
                  )}>
                    {tx.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">
                      {categoryLabels[tx.category] || tx.category}
                    </div>
                    <div className="text-white/40 text-xs">
                      {tx.description || format(new Date(tx.date), 'yyyy/MM/dd')}
                    </div>
                  </div>
                  <div className={cn(
                    'font-bold text-sm',
                    tx.type === 'income' ? 'text-emerald-400' : 'text-red-400',
                  )}>
                    {tx.type === 'income' ? '+' : '-'}{formatPrice(tx.amount)}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('حذف شود؟')) deleteMutation.mutate(tx.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <AddTransactionModal
            onClose={() => setShowAdd(false)}
            defaultType={addType}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// Add Transaction Modal
// ============================================
function AddTransactionModal({ onClose, defaultType }: { onClose: () => void; defaultType: string }) {
  const queryClient = useQueryClient();
  const [type, setType] = useState(defaultType);
  const [category, setCategory] = useState('other');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: (data: any) => financeApi.createTransaction(data),
    onSuccess: () => {
      toast.success('تراکنش ثبت شد ✅');
      queryClient.invalidateQueries({ queryKey: ['finance-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] });
      queryClient.invalidateQueries({ queryKey: ['finance-chart'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseInt(amount) < 1) {
      toast.error('مبلغ را وارد کن');
      return;
    }
    createMutation.mutate({
      type,
      category,
      amount: parseInt(amount),
      description: description.trim() || undefined,
    });
  };

  const incomeCategories = [
    { key: 'salary', label: 'حقوق', emoji: '💼' },
    { key: 'business', label: 'کسب‌وکار', emoji: '🏪' },
    { key: 'investment', label: 'سرمایه‌گذاری', emoji: '📈' },
    { key: 'gift', label: 'هدیه', emoji: '🎁' },
    { key: 'other', label: 'سایر', emoji: '💰' },
  ];

  const expenseCategories = [
    { key: 'food', label: 'خورد و خوراک', emoji: '🍔' },
    { key: 'transport', label: 'حمل و نقل', emoji: '🚗' },
    { key: 'housing', label: 'مسکن', emoji: '🏠' },
    { key: 'health', label: 'سلامت', emoji: '💊' },
    { key: 'education', label: 'آموزش', emoji: '📚' },
    { key: 'entertainment', label: 'تفریح', emoji: '🎬' },
    { key: 'shopping', label: 'خرید', emoji: '🛍️' },
    { key: 'bills', label: 'قبوض', emoji: '📄' },
    { key: 'other', label: 'سایر', emoji: '📦' },
  ];

  const categories = type === 'income' ? incomeCategories : expenseCategories;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md pointer-events-auto max-h-[90vh] overflow-y-auto"
        >
          <Card className="p-6">
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-xl font-bold text-white">تراکنش جدید</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/5">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={cn(
                    'py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                    type === 'expense'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'text-white/50 hover:text-white',
                  )}
                >
                  <TrendingDown className="w-4 h-4" />
                  هزینه
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={cn(
                    'py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2',
                    type === 'income'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-white/50 hover:text-white',
                  )}
                >
                  <TrendingUp className="w-4 h-4" />
                  درآمد
                </button>
              </div>

              {/* Amount */}
              <Input
                label="مبلغ (تومان)"
                placeholder="500000"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                dir="ltr"
                autoFocus
              />

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">دسته</label>
                <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategory(cat.key)}
                      className={cn(
                        'py-2.5 px-2 rounded-xl text-xs transition-all flex flex-col items-center gap-1',
                        category === cat.key
                          ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                          : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10',
                      )}
                    >
                      <span className="text-lg leading-none">{cat.emoji}</span>
                      <span className="text-center leading-tight">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <Input
                label="توضیحات (اختیاری)"
                placeholder="مثلاً: خرید از فروشگاه"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                isLoading={createMutation.isPending}
              >
                ثبت تراکنش
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
