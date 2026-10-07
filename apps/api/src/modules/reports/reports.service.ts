import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // Comprehensive Dashboard
  // ============================================
  async getOverview(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Parallel queries
    const [
      obligations,
      assets,
      familyMembers,
      transactionsMonth,
      transactionsYear,
      notifications,
      documents,
    ] = await Promise.all([
      this.prisma.obligation.findMany({
        where: { userId, status: { not: 'completed' } },
      }),
      this.prisma.asset.findMany({
        where: { userId, deletedAt: null, status: 'active' },
      }),
      this.prisma.familyMember.count({
        where: { userId },
      }).catch(() => 0),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: startOfMonth } },
      }),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: startOfYear } },
      }),
      this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
      this.prisma.document.count({
        where: { userId, deletedAt: null },
      }),
    ]);

    // Computations
    const activeObligations = obligations.length;
    const overdueObligations = obligations.filter(
      (o) => new Date(o.dueDate) < now,
    ).length;
    const upcomingObligations = obligations.filter((o) => {
      const diff = new Date(o.dueDate).getTime() - now.getTime();
      return diff > 0 && diff < 30 * 24 * 60 * 60 * 1000;
    }).length;

    const totalAssets = assets.length;
    const totalAssetsValue = assets.reduce(
      (sum, a) => sum + Number(a.currentValue || 0),
      0,
    );

    const monthIncome = transactionsMonth
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const monthExpense = transactionsMonth
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const yearIncome = transactionsYear
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const yearExpense = transactionsYear
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Discipline score (0-100)
    const totalObligations = await this.prisma.obligation.count({
      where: { userId },
    });
    const completedObligations = await this.prisma.obligation.count({
      where: { userId, status: 'completed' },
    });
    const disciplineScore =
      totalObligations > 0
        ? Math.round((completedObligations / totalObligations) * 100)
        : 85;

    return {
      obligations: {
        active: activeObligations,
        overdue: overdueObligations,
        upcoming: upcomingObligations,
      },
      assets: {
        total: totalAssets,
        totalValue: totalAssetsValue,
      },
      family: {
        members: familyMembers,
      },
      finance: {
        month: {
          income: monthIncome,
          expense: monthExpense,
          balance: monthIncome - monthExpense,
        },
        year: {
          income: yearIncome,
          expense: yearExpense,
          balance: yearIncome - yearExpense,
        },
      },
      notifications: {
        unread: notifications,
      },
      documents: {
        total: documents,
      },
      disciplineScore,
    };
  }

  // ============================================
  // Discipline Score History (6 months)
  // ============================================
  async getDisciplineHistory(userId: string, months = 6) {
    const results: any[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );

      const [total, completed] = await Promise.all([
        this.prisma.obligation.count({
          where: {
            userId,
            createdAt: { lte: end },
          },
        }),
        this.prisma.obligation.count({
          where: {
            userId,
            status: 'completed',
            completedAt: { gte: start, lte: end },
          },
        }),
      ]);

      const score = total > 0 ? Math.round((completed / total) * 100) : 0;

      results.push({
        month: start.toLocaleDateString('fa-IR', { month: 'short' }),
        score: Math.min(score, 100),
      });
    }

    return results;
  }

  // ============================================
  // Category Breakdown
  // ============================================
  async getObligationsByCategory(userId: string) {
    const obligations = await this.prisma.obligation.findMany({
      where: { userId },
      select: { category: true, status: true },
    });

    const byCategory: Record<string, { total: number; completed: number }> = {};

    obligations.forEach((o) => {
      if (!byCategory[o.category]) {
        byCategory[o.category] = { total: 0, completed: 0 };
      }
      byCategory[o.category].total++;
      if (o.status === 'completed') {
        byCategory[o.category].completed++;
      }
    });

    return Object.entries(byCategory).map(([category, data]) => ({
      category,
      total: data.total,
      completed: data.completed,
      completionRate:
        data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));
  }

  // ============================================
  // Yearly Summary
  // ============================================
  async getYearlySummary(userId: string) {
    const year = new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);

    const [txs, obligations, assets] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: start, lte: end } },
      }),
      this.prisma.obligation.findMany({
        where: { userId, createdAt: { gte: start, lte: end } },
      }),
      this.prisma.asset.findMany({
        where: { userId, deletedAt: null, status: 'active' },
      }),
    ]);

    const income = txs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = txs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const completedObligations = obligations.filter(
      (o) => o.status === 'completed',
    ).length;

    const totalAssetsValue = assets.reduce(
      (sum, a) => sum + Number(a.currentValue || 0),
      0,
    );

    return {
      year,
      income,
      expense,
      balance: income - expense,
      savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
      obligations: {
        total: obligations.length,
        completed: completedObligations,
        completionRate:
          obligations.length > 0
            ? Math.round((completedObligations / obligations.length) * 100)
            : 0,
      },
      assets: {
        total: assets.length,
        totalValue: totalAssetsValue,
      },
    };
  }

  // ============================================
  // Dashboard Summary (for home page)
  // ============================================
  async getDashboardSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayObligations,
      upcomingObligations,
      obligationsStats,
      assetsStats,
      transactionsMonth,
      unreadNotifs,
      familyMember,
    ] = await Promise.all([
      this.prisma.obligation.findMany({
        where: {
          userId,
          status: { not: 'completed' },
          dueDate: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lte: new Date(now.setHours(23, 59, 59, 999)),
          },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      this.prisma.obligation.findMany({
        where: {
          userId,
          status: { not: 'completed' },
          dueDate: { gt: new Date() },
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
      }),
      this.prisma.obligation.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      this.prisma.asset.aggregate({
        where: { userId, deletedAt: null, status: 'active' },
        _count: true,
        _sum: { currentValue: true },
      }),
      this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: startOfMonth } },
        select: { type: true, amount: true },
      }),
      this.prisma.notification.count({
        where: { userId, readAt: null },
      }),
      this.prisma.familyMember.findFirst({
        where: { userId },
        include: { family: { include: { members: true } } },
      }),
    ]);

    const totalObligations = obligationsStats.reduce(
      (sum, s) => sum + s._count,
      0,
    );
    const completed = obligationsStats.find((s) => s.status === 'completed')?._count || 0;
    const active = obligationsStats.find((s) => s.status === 'active')?._count || 0;

    const monthIncome = transactionsMonth
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const monthExpense = transactionsMonth
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const disciplineScore =
      totalObligations > 0
        ? Math.round((completed / totalObligations) * 100)
        : 85;

    return {
      todayObligations,
      upcomingObligations,
      stats: {
        disciplineScore,
        activeObligations: active,
        completedObligations: completed,
        totalAssets: assetsStats._count || 0,
        totalAssetsValue: Number(assetsStats._sum.currentValue || 0),
        monthIncome,
        monthExpense,
        monthBalance: monthIncome - monthExpense,
        unreadNotifications: unreadNotifs,
      },
      family: familyMember
        ? {
            name: familyMember.family.name,
            memberCount: familyMember.family.members.length,
            maxMembers: familyMember.family.maxMembers,
          }
        : null,
    };
  }

}
