'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Crown, Heart, Baby, Users, User, Shield, Loader2, ArrowRight,
  Network, Info,
} from 'lucide-react';
import { familyTreeApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const roleConfig: any = {
  owner: { label: 'مالک', icon: Crown, gradient: 'from-amber-500 to-orange-500', ring: 'ring-amber-500/50' },
  admin: { label: 'مدیر', icon: Shield, gradient: 'from-purple-500 to-pink-500', ring: 'ring-purple-500/50' },
  member: { label: 'عضو', icon: User, gradient: 'from-cyan-500 to-blue-500', ring: 'ring-cyan-500/50' },
  child: { label: 'فرزند', icon: Baby, gradient: 'from-pink-500 to-rose-500', ring: 'ring-pink-500/50' },
  elder: { label: 'سالمند', icon: Heart, gradient: 'from-orange-500 to-red-500', ring: 'ring-orange-500/50' },
  observer: { label: 'ناظر', icon: Users, gradient: 'from-gray-500 to-slate-500', ring: 'ring-gray-500/50' },
};

const relationLabels: any = {
  self: 'خود',
  spouse: 'همسر',
  child: 'فرزند',
  parent: 'والد',
  sibling: 'خواهر/برادر',
  in_law: 'سببی',
  other: 'سایر',
};

export default function FamilyTreePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['family-tree'],
    queryFn: () => familyTreeApi.getTree(),
  });

  const tree = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  if (!tree || !tree.owner) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">شجره‌نامه</h1>
          <p className="text-white/50">نمای بصری خانواده</p>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center">
              <Network className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              هنوز خانواده‌ای نداری
            </h3>
            <p className="text-white/50 mb-6">
              برای دیدن شجره‌نامه، اول یک خانواده بساز
            </p>
            <Link
              href="/dashboard/family"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium hover:scale-105 transition-all"
            >
              <Users className="w-5 h-5" />
              ساخت خانواده
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const MemberNode = ({ member, size = 'normal' }: any) => {
    const config = roleConfig[member.role] || roleConfig.member;
    const Icon = config.icon;
    const isLarge = size === 'large';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className={cn(
          'relative flex flex-col items-center gap-2 transition-all cursor-pointer group',
        )}
      >
        <div
          className={cn(
            'rounded-3xl flex items-center justify-center relative shadow-xl',
            isLarge ? 'w-24 h-24' : 'w-16 h-16',
            'bg-gradient-to-br',
            config.gradient,
            'ring-4',
            config.ring,
          )}
        >
          <span
            className={cn(
              'font-black text-white',
              isLarge ? 'text-4xl' : 'text-2xl',
            )}
          >
            {member.name?.charAt(0) || '?'}
          </span>

          {member.isOwner && (
            <Crown className="w-5 h-5 text-white absolute -top-2 -right-2 drop-shadow-lg" />
          )}
        </div>

        <div className="text-center">
          <div
            className={cn(
              'font-bold text-white truncate max-w-[120px]',
              isLarge ? 'text-base' : 'text-sm',
            )}
          >
            {member.name}
          </div>
          <div className="text-white/50 text-xs">
            {relationLabels[member.relation] || config.label}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">شجره‌نامه</h1>
          <p className="text-white/50">
            خانواده {tree.familyName} — {tree.totalMembers} از {tree.maxMembers} عضو
          </p>
        </div>
        <Link
          href="/dashboard/family"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-sm transition-colors"
        >
          <Users className="w-4 h-4" />
          مدیریت خانواده
        </Link>
      </div>

      {/* Tree Visualization */}
      <Card className="overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <div className="relative">
            {/* Background pattern */}
            <div className="absolute inset-0 grid-pattern opacity-20 rounded-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />

            <div className="relative flex flex-col items-center gap-8">
              {/* ============================================ */}
              {/* Parents */}
              {/* ============================================ */}
              {tree.parents && tree.parents.length > 0 && (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-xs text-white/40 font-medium">
                    والدین
                  </div>
                  <div className="flex items-center gap-6">
                    {tree.parents.map((parent: any) => (
                      <MemberNode key={parent.id} member={parent} />
                    ))}
                  </div>

                  {/* Connector line down */}
                  <div className="w-px h-8 bg-gradient-to-b from-purple-500/40 to-transparent" />
                </div>
              )}

              {/* ============================================ */}
              {/* Owner + Spouse */}
              {/* ============================================ */}
              <div className="flex flex-col items-center gap-3">
                <div className="text-xs text-white/40 font-medium">
                  هسته‌ی خانواده
                </div>

                <div className="flex items-center gap-6 relative">
                  <MemberNode member={tree.owner} size="large" />

                  {/* Marriage connector */}
                  {tree.spouse && (
                    <>
                      <div className="relative">
                        <Heart className="w-6 h-6 text-pink-400 fill-pink-400/30 animate-pulse" />
                      </div>
                      <MemberNode member={tree.spouse} size="large" />
                    </>
                  )}
                </div>

                {/* Connector line down to children */}
                {(tree.children?.length > 0 || tree.siblings?.length > 0) && (
                  <div className="w-px h-8 bg-gradient-to-b from-purple-500/40 to-transparent" />
                )}
              </div>

              {/* ============================================ */}
              {/* Children */}
              {/* ============================================ */}
              {tree.children && tree.children.length > 0 && (
                <div className="flex flex-col items-center gap-3">
                  <div className="text-xs text-white/40 font-medium">
                    فرزندان
                  </div>

                  {/* Horizontal connector */}
                  <div className="relative flex items-start gap-6">
                    {tree.children.length > 1 && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-4rem)] h-px bg-purple-500/30" />
                    )}

                    {tree.children.map((child: any) => (
                      <div key={child.id} className="flex flex-col items-center gap-2">
                        <div className="w-px h-4 bg-purple-500/30" />
                        <MemberNode member={child} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================ */}
              {/* Siblings */}
              {/* ============================================ */}
              {tree.siblings && tree.siblings.length > 0 && (
                <div className="flex flex-col items-center gap-3 mt-4">
                  <div className="text-xs text-white/40 font-medium">
                    خواهر و برادر
                  </div>
                  <div className="flex items-center gap-6 flex-wrap justify-center">
                    {tree.siblings.map((sibling: any) => (
                      <MemberNode key={sibling.id} member={sibling} />
                    ))}
                  </div>
                </div>
              )}

              {/* ============================================ */}
              {/* Others */}
              {/* ============================================ */}
              {tree.others && tree.others.length > 0 && (
                <div className="flex flex-col items-center gap-3 mt-4">
                  <div className="text-xs text-white/40 font-medium">
                    سایر اعضا
                  </div>
                  <div className="flex items-center gap-6 flex-wrap justify-center">
                    {tree.others.map((other: any) => (
                      <MemberNode key={other.id} member={other} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty slots */}
              {tree.totalMembers < tree.maxMembers && (
                <Link
                  href="/dashboard/family"
                  className="flex flex-col items-center gap-2 mt-6 group"
                >
                  <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/20 group-hover:border-purple-500/50 flex items-center justify-center transition-colors">
                    <Users className="w-6 h-6 text-white/30 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <div className="text-xs text-white/40 group-hover:text-white/70 transition-colors">
                    دعوت عضو جدید
                  </div>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{tree.owner ? 1 : 0}</div>
              <div className="text-white/50 text-xs">مالک</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{tree.spouse ? 1 : 0}</div>
              <div className="text-white/50 text-xs">همسر</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Baby className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{tree.children?.length || 0}</div>
              <div className="text-white/50 text-xs">فرزندان</div>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-white">{tree.totalMembers}</div>
              <div className="text-white/50 text-xs">کل اعضا</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Info */}
      <Card className="border-purple-500/20 bg-purple-500/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm mb-1">
                درباره شجره‌نامه
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">
                شجره‌نامه به‌صورت خودکار از روابط اعضای خانواده شما ساخته
                می‌شود. برای اضافه کردن عضو جدید یا تغییر نسبت‌ها، به صفحه
                «مدیریت خانواده» بروید.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
