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
}
