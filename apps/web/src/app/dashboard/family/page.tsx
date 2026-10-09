
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Copy, Check, Crown, Shield, Eye, User,
  Trash2, Loader2, X, Baby, Heart,
} from 'lucide-react';
import { toast } from 'sonner';
import { familyApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const roleConfig: any = {
  owner: { label: 'مالک', icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  admin: { label: 'مدیر', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  member: { label: 'عضو', icon: User, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  child: { label: 'فرزند', icon: Baby, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' },
  elder: { label: 'سالمند', icon: Heart, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  observer: { label: 'ناظر', icon: Eye, color: 'text-white/60', bg: 'bg-white/5', border: 'border-white/20' },
};

const relationLabels: any = {
  self: 'خودم',
  spouse: 'همسر',
  child: 'فرزند',
  parent: 'والد',
  sibling: 'خواهر/برادر',
  in_law: 'فامیل سببی',
  other: 'سایر',
};

export default function FamilyPage() {
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState(false);
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteRelation, setInviteRelation] = useState('other');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);

  const { data: familyData, isLoading } = useQuery({
    queryKey: ['family'],
    queryFn: () => familyApi.getMy(),
  });

  const family = familyData?.data;

  const inviteMutation = useMutation({
    mutationFn: (data: any) => familyApi.invite(data),
    onSuccess: (res) => {
      setInviteCode(res.data.code);
      toast.success('دعوت‌نامه ساخته شد');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا در ارسال دعوت');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => familyApi.removeMember(id),
    onSuccess: () => {
      toast.success('عضو حذف شد');
      queryClient.invalidateQueries({ queryKey: ['family'] });
    },
  });

  const copyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('کد کپی شد');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^09[0-9]{9}$/.test(invitePhone)) {
      toast.error('شماره موبایل نامعتبر است');
      return;
    }
    inviteMutation.mutate({ phone: invitePhone, role: inviteRole, relation: inviteRelation });
  };

  const closeInvite = () => {
    setShowInvite(false);
    setInvitePhone('');
    setInviteCode('');
    setCopied(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">خانواده</h1>
          <p className="text-white/50">هنوز خانواده‌ای نساخته‌ای</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center animate-float">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">خانواده‌ات را وصل کن</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed">
              با ساخت خانواده، می‌توانی همسر، فرزندان و والدینت را دعوت کنی
            </p>
            <CreateFamilyForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['family'] })} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const members = family.members || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">{family.name}</h1>
          <p className="text-white/50">{members.length} از {family.maxMembers} عضو</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          disabled={members.length >= family.maxMembers}
          className={cn(
            'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all',
            members.length >= family.maxMembers
              ? 'bg-white/5 text-white/30 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/30 hover:scale-105',
          )}
        >
          <Plus className="w-5 h-5" />
          دعوت عضو جدید
        </button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">ظرفیت خانواده</span>
          <span className="text-sm text-white font-bold">{members.length} / {family.maxMembers}</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(members.length / family.maxMembers) * 100}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
          />
        </div>
      </Card>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">اعضای خانواده</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {members.map((member: any, i: number) => {
              const config = roleConfig[member.role] || roleConfig.member;
              const Icon = config.icon;
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className={cn('group hover:border-purple-500/30 transition-all', config.border)}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative', config.bg)}>
                          <span className="text-2xl font-bold text-white">{member.user?.fullName?.charAt(0) || '?'}</span>
                          {member.role === 'owner' && <Crown className="w-4 h-4 text-amber-400 absolute -top-1 -right-1" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-white text-base mb-1 truncate">{member.user?.fullName || 'کاربر'}</h3>
                          <p className="text-white/40 text-xs mb-3" dir="ltr">{member.user?.phone}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs', config.bg, config.color)}>
                              <Icon className="w-3 h-3" />
                              {config.label}
                            </span>
                            {member.relation && member.relation !== 'self' && (
                              <span className="text-white/40 text-xs">{relationLabels[member.relation] || member.relation}</span>
                            )}
                          </div>
                          {member.role !== 'owner' && (
                            <button
                              onClick={() => {
                                if (confirm('این عضو حذف شود؟')) removeMutation.mutate(member.id);
                              }}
                              className="mt-3 text-xs text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              حذف عضو
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {members.length < family.maxMembers && (
            <button
              onClick={() => setShowInvite(true)}
              className="border-2 border-dashed border-white/10 hover:border-purple-500/40 rounded-3xl p-8 transition-all group flex flex-col items-center justify-center gap-3 min-h-[160px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-purple-500/20 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-white/40 group-hover:text-purple-400 transition-colors" />
              </div>
              <span className="text-white/40 group-hover:text-white/70 text-sm transition-colors">دعوت عضو جدید</span>
            </button>
          )}
        </div>
      </div>

      {/* Invite Modal - Compact */}
      <AnimatePresence>
        {showInvite && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeInvite}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-md pointer-events-auto max-h-[90vh] overflow-y-auto"
              >
                <Card className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-white">دعوت عضو جدید</h2>
                      <p className="text-white/50 text-xs mt-0.5">شماره موبایل را وارد کن</p>
                    </div>
                    <button onClick={closeInvite} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {!inviteCode ? (
                    <form onSubmit={handleInvite} className="space-y-3">
                      <Input
                        label="شماره موبایل"
                        placeholder="09121234567"
                        type="tel"
                        inputMode="numeric"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        dir="ltr"
                        autoFocus
                      />

                      <div>
                        <label className="block text-xs font-medium text-white/80 mb-1.5">نقش</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { key: 'member', label: 'عضو', emoji: '👤' },
                            { key: 'child', label: 'فرزند', emoji: '👶' },
                            { key: 'elder', label: 'سالمند', emoji: '👴' },
                          ].map((r) => (
                            <button
                              key={r.key}
                              type="button"
                              onClick={() => setInviteRole(r.key)}
                              className={cn(
                                'py-2 px-2 rounded-lg text-xs transition-all flex flex-col items-center gap-0.5',
                                inviteRole === r.key
                                  ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                                  : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10',
                              )}
                            >
                              <span className="text-base leading-none">{r.emoji}</span>
                              <span>{r.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/80 mb-1.5">نسبت</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[
                            { key: 'spouse', label: 'همسر' },
                            { key: 'child', label: 'فرزند' },
                            { key: 'parent', label: 'والد' },
                            { key: 'sibling', label: 'خواهر/برادر' },
                            { key: 'in_law', label: 'سببی' },
                            { key: 'other', label: 'سایر' },
                          ].map((rel) => (
                            <button
                              key={rel.key}
                              type="button"
                              onClick={() => setInviteRelation(rel.key)}
                              className={cn(
                                'py-1.5 px-1 rounded-lg text-xs md:text-sm transition-all',
                                inviteRelation === rel.key
                                  ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                                  : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10',
                              )}
                            >
                              {rel.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button type="submit" variant="gradient" size="md" className="w-full mt-2" isLoading={inviteMutation.isPending}>
                        ساخت دعوت‌نامه
                      </Button>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/30 text-center">
                        <div className="text-xs text-purple-300 mb-1.5">کد دعوت</div>
                        <div className="text-xl font-black tracking-widest text-white font-mono mb-3" dir="ltr">{inviteCode}</div>
                        <button
                          onClick={copyCode}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs transition-colors"
                        >
                          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied ? 'کپی شد' : 'کپی کد'}
                        </button>
                      </div>
                      <div className="text-center text-white/50 text-xs md:text-sm">
                        این کد را به {invitePhone} بفرست — اعتبار ۷ روز
                      </div>
                      <Button onClick={closeInvite} variant="default" size="md" className="w-full">بستن</Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function CreateFamilyForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [plan, setPlan] = useState('family');

  const createMutation = useMutation({
    mutationFn: (data: any) => familyApi.create(data),
    onSuccess: () => {
      toast.success('خانواده ساخته شد 🎉');
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'خطا');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('نام خانواده را وارد کن');
      return;
    }
    createMutation.mutate({ name: name.trim(), plan });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <Input
        label="نام خانواده"
        placeholder="مثلاً: خانواده رضایی"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: 'personal', label: 'شخصی', desc: '۲ نفر' },
          { key: 'family', label: 'خانواده', desc: '۶ نفر', popular: true },
          { key: 'business', label: 'کسب‌وکار', desc: '۱۰ نفر' },
        ].map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPlan(p.key)}
            className={cn(
              'relative p-3 rounded-xl text-sm transition-all',
              plan === p.key
                ? 'bg-purple-500/20 border-2 border-purple-500/50 text-white'
                : 'bg-white/5 border-2 border-transparent text-white/60 hover:bg-white/10',
            )}
          >
            {p.popular && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] md:text-xs font-medium">
                محبوب
              </span>
            )}
            <div className="font-bold">{p.label}</div>
            <div className="text-xs opacity-70 mt-1">{p.desc}</div>
          </button>
        ))}
      </div>
      <Button type="submit" variant="gradient" size="lg" className="w-full" isLoading={createMutation.isPending}>
        <Users className="w-5 h-5" />
        ساخت خانواده
      </Button>
    </form>
  );
}
