import {
  Injectable, NotFoundException, ForbiddenException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(userId: string, dto: CreateTransactionDto) {
    const tx = await this.prisma.transaction.create({
      data: {
        userId,
        type: dto.type,
        category: dto.category,
        amount: BigInt(dto.amount),
        description: dto.description,
        date: dto.date ? new Date(dto.date) : new Date(),
      },
    });
    this.logger.log(`✅ ${dto.type}: ${dto.amount} تومان`);
    return this.serialize(tx);
  }

  async getTransactions(
    userId: string,
    filters?: { type?: string; from?: string; to?: string },
  ) {
    const where: any = { userId, deletedAt: null };
    if (filters?.type) where.type = filters.type;
    if (filters?.from || filters?.to) {
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) where.date.lte = new Date(filters.to);
    }

    const txs = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 100,
    });

    return txs.map((t) => this.serialize(t));
  }

  async updateTransaction(userId: string, id: string, dto: UpdateTransactionDto) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx || tx.deletedAt) throw new NotFoundException('تراکنش یافت نشد');
    if (tx.userId !== userId) throw new ForbiddenException('دسترسی ندارید');

    const data: any = { ...dto };
    if (dto.amount) data.amount = BigInt(dto.amount);
    if (dto.date) data.date = new Date(dto.date);

    const updated = await this.prisma.transaction.update({ where: { id }, data });
    return this.serialize(updated);
  }

  async deleteTransaction(userId: string, id: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id } });
    if (!tx || tx.deletedAt) throw new NotFoundException('تراکنش یافت نشد');
    if (tx.userId !== userId) throw new ForbiddenException('دسترسی ندارید');

    await this.prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { success: true };
  }

  async getStats(userId: string, period: 'month' | 'year' = 'month') {
    const now = new Date();
    let start: Date;

    if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      start = new Date(now.getFullYear(), 0, 1);
    }

    const txs = await this.prisma.transaction.findMany({
      where: { userId, deletedAt: null, date: { gte: start } },
    });

    const income = txs
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = txs
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expense;

    const byCategory: Record<string, number> = {};
    txs.filter((t) => t.type === 'expense').forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + Number(t.amount);
    });

    return { income, expense, balance, count: txs.length, byCategory, period };
  }

  async getMonthlyChart(userId: string, months = 6) {
    const results: any[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const txs = await this.prisma.transaction.findMany({
        where: { userId, deletedAt: null, date: { gte: start, lte: end } },
      });

      const income = txs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = txs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      results.push({
        month: start.toLocaleDateString('fa-IR', { month: 'short' }),
        year: start.getFullYear(),
        income,
        expense,
        balance: income - expense,
      });
    }

    return results;
  }

  async createBudget(userId: string, dto: CreateBudgetDto) {
    const budget = await this.prisma.budget.upsert({
      where: {
        userId_category_period: {
          userId,
          category: dto.category,
          period: dto.period,
        },
      },
      create: {
        userId,
        category: dto.category,
        amount: BigInt(dto.amount),
        period: dto.period,
      },
      update: { amount: BigInt(dto.amount) },
    });
    return { ...budget, amount: Number(budget.amount) };
  }

  async getBudgets(userId: string) {
    const budgets = await this.prisma.budget.findMany({ where: { userId } });
    return budgets.map((b) => ({ ...b, amount: Number(b.amount) }));
  }

  async deleteBudget(userId: string, id: string) {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    if (!budget) throw new NotFoundException('بودجه یافت نشد');
    if (budget.userId !== userId) throw new ForbiddenException('دسترسی ندارید');
    await this.prisma.budget.delete({ where: { id } });
    return { success: true };
  }

  private serialize(tx: any) {
    return { ...tx, amount: Number(tx.amount) };
  }
}
