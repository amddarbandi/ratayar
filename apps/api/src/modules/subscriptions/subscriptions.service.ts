import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // === Get or auto-create the free subscription for a user ===
  async getActiveSubscription(userId: string) {
    let sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { startedAt: 'desc' },
      include: { plan: true },
    });

    if (!sub) {
      // auto-provision free plan
      const freePlan = await this.prisma.plan.findUnique({
        where: { code: 'free' },
      });
      if (!freePlan) {
        throw new NotFoundException('پلن رایگان یافت نشد');
      }
      sub = await this.prisma.subscription.create({
        data: {
          userId,
          planId: freePlan.id,
          status: 'active',
          startedAt: new Date(),
        },
        include: { plan: true },
      });
      this.logger.log(`✅ Free subscription created for user ${userId}`);
    }

    return this.serialize(sub);
  }

  // === Used by PlanLimitGuard and other modules ===
  async getActivePlan(userId: string) {
    const sub = await this.getActiveSubscription(userId);
    return sub.plan;
  }

  async getHistory(userId: string) {
    const subs = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    return subs.map((s) => this.serialize(s));
  }

  async cancel(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { startedAt: 'desc' },
    });
    if (!sub) throw new NotFoundException('اشتراک فعالی یافت نشد');

    // نمی‌توان پلن رایگان را لغو کرد
    const plan = await this.prisma.plan.findUnique({
      where: { id: sub.planId },
    });
    if (plan?.code === 'free') {
      throw new BadRequestException('پلن رایگان قابل لغو نیست');
    }

    const updated = await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { status: 'cancelled', cancelledAt: new Date() },
      include: { plan: true },
    });
    this.logger.log(`✅ Subscription cancelled for user ${userId}`);

    // immediately fall back to free plan
    await this.getActiveSubscription(userId);

    return this.serialize(updated);
  }

  // === Called by payments module on admin approval ===
  async activate(
    userId: string,
    planId: string,
    months: number = 1,
  ) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('پلن یافت نشد یا غیرفعال است');
    }

    // expire current active
    await this.prisma.subscription.updateMany({
      where: { userId, status: 'active' },
      data: { status: 'expired' },
    });

    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    expiresAt.setMonth(expiresAt.getMonth() + months);

    const created = await this.prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: 'active',
        startedAt,
        expiresAt,
      },
      include: { plan: true },
    });

    this.logger.log(
      `✅ Subscription activated: user=${userId} plan=${plan.code} months=${months}`,
    );
    return this.serialize(created);
  }

  // === Admin listing ===
  async listAll(opts?: { status?: string; limit?: number }) {
    const subs = await this.prisma.subscription.findMany({
      where: opts?.status ? { status: opts.status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: opts?.limit ?? 100,
      include: {
        plan: true,
        user: { select: { id: true, phone: true, fullName: true } },
      },
    });
    return subs.map((s) => ({
      ...this.serialize(s),
      user: (s as any).user,
    }));
  }

  private serialize(s: any) {
    return {
      id: s.id,
      status: s.status,
      startedAt: s.startedAt,
      expiresAt: s.expiresAt,
      cancelledAt: s.cancelledAt,
      createdAt: s.createdAt,
      plan: s.plan
        ? {
            id: s.plan.id,
            code: s.plan.code,
            name: s.plan.name,
            priceMonthly: s.plan.priceMonthly?.toString(),
            maxMembers: s.plan.maxMembers,
            maxObligations: s.plan.maxObligations,
            maxAssets: s.plan.maxAssets,
            maxDocuments: s.plan.maxDocuments,
            maxStorageMB: s.plan.maxStorageMB,
            maxUploadMB: s.plan.maxUploadMB,
            allowedFormats: s.plan.allowedFormats,
            features: s.plan.features,
          }
        : null,
    };
  }
}
