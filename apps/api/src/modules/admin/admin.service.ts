import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ═══════════════════════════════════════════
  // Overview KPIs
  // ═══════════════════════════════════════════
  async getOverview() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      userCount,
      activeUserCount,
      newUsersThisMonth,
      newUsersLastMonth,
      familyCount,
      activeSubs,
      planBreakdown,
      pendingPayments,
      approvedPaymentsThisMonth,
      approvedPaymentsLastMonth,
      openTickets,
      docsCount,
      docsAgg,
      obligCount,
      auditRecent,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.prisma.user.count({
        where: { deletedAt: null, status: 'active' },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: startOfMonth }, deletedAt: null },
      }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          deletedAt: null,
        },
      }),
      this.prisma.family.count().catch(() => 0),
      this.prisma.subscription.count({ where: { status: 'active' } }),
      this.prisma.subscription.groupBy({
        by: ['planId'],
        where: { status: 'active' },
        _count: { _all: true },
      }),
      this.prisma.paymentRequest.count({ where: { status: 'pending' } }),
      this.prisma.paymentRequest.findMany({
        where: {
          status: 'approved',
          reviewedAt: { gte: startOfMonth },
        },
        select: { amount: true },
      }),
      this.prisma.paymentRequest.findMany({
        where: {
          status: 'approved',
          reviewedAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        select: { amount: true },
      }),
      this.prisma.ticket.count({ where: { status: { not: 'closed' } } }),
      this.prisma.document.count({ where: { deletedAt: null } }),
      this.prisma.document.aggregate({
        where: { deletedAt: null },
        _sum: { size: true },
      }),
      this.prisma.obligation.count().catch(() => 0),
      this.audit.list({ limit: 10 }),
    ]);

    // Plan names
    const planIds = planBreakdown.map((p) => p.planId);
    const plans = await this.prisma.plan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, code: true, name: true },
    });
    const planById = new Map(plans.map((p) => [p.id, p]));

    const sumAmount = (arr: { amount: bigint }[]) =>
      arr.reduce((s, p) => s + Number(p.amount), 0);

    const revenueThisMonth = sumAmount(approvedPaymentsThisMonth);
    const revenueLastMonth = sumAmount(approvedPaymentsLastMonth);

    const growthPct =
      newUsersLastMonth > 0
        ? Math.round(
            ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) *
              100,
          )
        : newUsersThisMonth > 0
          ? 100
          : 0;

    const revenueGrowthPct =
      revenueLastMonth > 0
        ? Math.round(
            ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
          )
        : revenueThisMonth > 0
          ? 100
          : 0;

    const storageBytes = Number(docsAgg._sum.size ?? BigInt(0));

    return {
      kpis: {
        users: {
          total: userCount,
          active: activeUserCount,
          newThisMonth: newUsersThisMonth,
          growthPct,
        },
        revenue: {
          thisMonthToman: revenueThisMonth,
          lastMonthToman: revenueLastMonth,
          growthPct: revenueGrowthPct,
        },
        subscriptions: {
          active: activeSubs,
          pendingPayments,
        },
        content: {
          documents: docsCount,
          storageBytes,
          storageMB: +(storageBytes / 1024 / 1024).toFixed(2),
          obligations: obligCount,
          families: familyCount,
        },
        support: {
          openTickets,
        },
      },
      planBreakdown: planBreakdown.map((p) => ({
        planId: p.planId,
        code: planById.get(p.planId)?.code || '?',
        name: planById.get(p.planId)?.name || '?',
        count: p._count._all,
      })),
      recentAudit: auditRecent.items,
    };
  }

  // ═══════════════════════════════════════════
  // Audit log listing
  // ═══════════════════════════════════════════
  async listAudit(opts: {
    limit?: number;
    offset?: number;
    action?: string;
    actorId?: string;
    targetType?: string;
    targetId?: string;
  }) {
    return this.audit.list(opts);
  }

  // ═══════════════════════════════════════════
  // Users
  // ═══════════════════════════════════════════
  async listUsers(opts: {
    q?: string;
    status?: string;
    role?: string;
    plan?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { deletedAt: null };
    if (opts.q) {
      where.OR = [
        { phone: { contains: opts.q } },
        { fullName: { contains: opts.q } },
      ];
    }
    if (opts.status) where.status = opts.status;
    if (opts.role) where.role = opts.role;

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(opts.limit ?? 30, 100),
        skip: opts.offset ?? 0,
        select: {
          id: true,
          phone: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          subscriptions: {
            where: { status: 'active' },
            take: 1,
            orderBy: { startedAt: 'desc' },
            include: { plan: { select: { code: true, name: true } } },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id,
        phone: u.phone,
        fullName: u.fullName,
        role: u.role,
        status: u.status,
        createdAt: u.createdAt,
        plan: u.subscriptions[0]?.plan?.code ?? 'free',
        planName: u.subscriptions[0]?.plan?.name ?? 'رایگان',
      })),
      total,
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        phone: true,
        fullName: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });
    if (!user) return null;

    const [
      sub,
      payments,
      tickets,
      docs,
      docsAgg,
      obligCount,
      assetCount,
      auditRecent,
    ] = await Promise.all([
      this.prisma.subscription.findFirst({
        where: { userId: id, status: 'active' },
        orderBy: { startedAt: 'desc' },
        include: { plan: true },
      }),
      this.prisma.paymentRequest.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { plan: { select: { code: true, name: true } } },
      }),
      this.prisma.ticket.findMany({
        where: { userId: id },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      }),
      this.prisma.document.count({ where: { userId: id, deletedAt: null } }),
      this.prisma.document.aggregate({
        where: { userId: id, deletedAt: null },
        _sum: { size: true },
      }),
      this.prisma.obligation.count({ where: { userId: id } }).catch(() => 0),
      this.prisma.asset.count({ where: { userId: id } }),
      this.audit.list({ limit: 10, actorId: id }),
    ]);

    const storageBytes = Number(docsAgg._sum.size ?? BigInt(0));

    return {
      user,
      subscription: sub
        ? {
            status: sub.status,
            startedAt: sub.startedAt,
            expiresAt: sub.expiresAt,
            plan: {
              code: sub.plan.code,
              name: sub.plan.name,
              priceMonthly: sub.plan.priceMonthly.toString(),
              maxObligations: sub.plan.maxObligations,
              maxDocuments: sub.plan.maxDocuments,
              maxStorageMB: sub.plan.maxStorageMB,
            },
          }
        : null,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount.toString(),
        status: p.status,
        method: p.method,
        planCode: p.plan.code,
        planName: p.plan.name,
        createdAt: p.createdAt,
        reviewedAt: p.reviewedAt,
      })),
      tickets: tickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        category: t.category,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      usage: {
        documents: docs,
        storageBytes,
        storageMB: +(storageBytes / 1024 / 1024).toFixed(2),
        obligations: obligCount,
        assets: assetCount,
      },
      recentAudit: auditRecent.items,
    };
  }

  async banUser(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { status: 'banned' },
    });
    return { ok: true };
  }

  async unbanUser(id: string) {
    await this.prisma.user.update({
      where: { id },
      data: { status: 'active' },
    });
    return { ok: true };
  }

  async setUserRole(id: string, role: string) {
    const allowed = ['user', 'admin', 'support', 'billing', 'analyst'];
    if (!allowed.includes(role)) {
      throw new Error('نقش نامعتبر');
    }
    await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    return { ok: true };
  }


  // ═══════════════════════════════════════════
  // Subscriptions
  // ═══════════════════════════════════════════
  async listSubscriptions(opts: {
    status?: string;
    planCode?: string;
    expiringIn?: number; // days
    q?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (opts.status) where.status = opts.status;
    if (opts.planCode) where.plan = { code: opts.planCode };
    if (opts.expiringIn !== undefined && opts.expiringIn > 0) {
      const until = new Date();
      until.setDate(until.getDate() + opts.expiringIn);
      where.expiresAt = { lte: until, gte: new Date() };
      where.status = 'active';
    }
    if (opts.q) {
      where.user = {
        OR: [
          { phone: { contains: opts.q } },
          { fullName: { contains: opts.q } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(opts.limit ?? 30, 100),
        skip: opts.offset ?? 0,
        include: {
          plan: { select: { code: true, name: true, priceMonthly: true } },
          user: { select: { id: true, phone: true, fullName: true } },
        },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      items: items.map((s) => ({
        id: s.id,
        status: s.status,
        startedAt: s.startedAt,
        expiresAt: s.expiresAt,
        cancelledAt: s.cancelledAt,
        createdAt: s.createdAt,
        plan: {
          code: s.plan.code,
          name: s.plan.name,
          priceMonthly: s.plan.priceMonthly.toString(),
        },
        user: s.user,
      })),
      total,
    };
  }

  async extendSubscription(id: string, months: number) {
    if (months < 1 || months > 60) {
      throw new Error('مدت باید بین ۱ تا ۶۰ ماه باشد');
    }
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new Error('اشتراک یافت نشد');

    const base = sub.expiresAt && sub.expiresAt > new Date()
      ? new Date(sub.expiresAt)
      : new Date();
    base.setMonth(base.getMonth() + months);

    await this.prisma.subscription.update({
      where: { id },
      data: { expiresAt: base, status: 'active', cancelledAt: null },
    });
    return { ok: true, expiresAt: base };
  }

  async cancelSubscription(id: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id } });
    if (!sub) throw new Error('اشتراک یافت نشد');
    await this.prisma.subscription.update({
      where: { id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    });
    return { ok: true };
  }

  // ═══════════════════════════════════════════
  // Revenue
  // ═══════════════════════════════════════════
  async getRevenue() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // MRR: sum of active paid subscriptions' monthly prices
    const activeSubs = await this.prisma.subscription.findMany({
      where: { status: 'active' },
      include: { plan: { select: { priceMonthly: true, code: true } } },
    });
    const mrr = activeSubs
      .filter((s) => s.plan.code !== 'free')
      .reduce((sum, s) => sum + Number(s.plan.priceMonthly), 0);

    // Last 12 months approved payments
    const monthsBack = 12;
    const since = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 1);

    const approved = await this.prisma.paymentRequest.findMany({
      where: {
        status: 'approved',
        reviewedAt: { gte: since },
      },
      select: { amount: true, reviewedAt: true },
    });

    // Group by month (Jalali month key kept as Gregorian for now; UI shows Jalali label)
    const monthly: Record<string, number> = {};
    for (let i = 0; i < monthsBack; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = 0;
    }
    for (const p of approved) {
      if (!p.reviewedAt) continue;
      const d = p.reviewedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthly) monthly[key] += Number(p.amount);
    }

    const monthSeries = Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, total]) => ({ month: key, total }));

    // This month vs last month
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthTotal = monthSeries.find((m) => m.month === thisMonthKey)?.total ?? 0;
    const lastMonthTotal = monthSeries.find((m) => m.month === lastMonthKey)?.total ?? 0;

    // Revenue by plan
    const byPlan: Record<string, { code: string; name: string; total: number; count: number }> = {};
    const paymentsWithPlan = await this.prisma.paymentRequest.findMany({
      where: { status: 'approved', reviewedAt: { gte: since } },
      include: { plan: { select: { code: true, name: true } } },
    });
    for (const p of paymentsWithPlan) {
      const key = p.plan.code;
      if (!byPlan[key]) {
        byPlan[key] = { code: p.plan.code, name: p.plan.name, total: 0, count: 0 };
      }
      byPlan[key].total += Number(p.amount);
      byPlan[key].count += 1;
    }

    return {
      mrr,
      arr: mrr * 12,
      thisMonthTotal,
      lastMonthTotal,
      growthPct:
        lastMonthTotal > 0
          ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
          : thisMonthTotal > 0
            ? 100
            : 0,
      monthSeries,
      byPlan: Object.values(byPlan).sort((a, b) => b.total - a.total),
    };
  }

  // ═══════════════════════════════════════════
  // Refund payment
  // ═══════════════════════════════════════════
  async refundPayment(id: string, adminId: string, reason: string) {
    const payment = await this.prisma.paymentRequest.findUnique({
      where: { id },
    });
    if (!payment) throw new Error('پرداخت یافت نشد');
    if (payment.status !== 'approved') {
      throw new Error('فقط پرداخت‌های تأییدشده قابل بازگشت هستند');
    }
    await this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'refunded',
        adminNote: reason || 'بازگشت پرداخت توسط ادمین',
      },
    });
    return { ok: true };
  }

}
