import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateNotificationDto) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        priority: dto.priority || 'normal',
        referenceId: dto.referenceId,
        referenceType: dto.referenceType,
        scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : new Date(),
      },
    });
  }

  async findAll(userId: string, filters?: { unreadOnly?: boolean; limit?: number }) {
    const where: any = { userId };
    if (filters?.unreadOnly) where.readAt = null;

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { count };
  }

  async markAsRead(userId: string, id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('اعلان یافت نشد');
    if (notif.userId !== userId) throw new ForbiddenException('دسترسی ندارید');

    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date(), status: 'read' },
    });
  }

  async markAllAsRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date(), status: 'read' },
    });
    return { success: true };
  }

  async remove(userId: string, id: string) {
    const notif = await this.prisma.notification.findUnique({ where: { id } });
    if (!notif) throw new NotFoundException('اعلان یافت نشد');
    if (notif.userId !== userId) throw new ForbiddenException('دسترسی ندارید');

    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }

  // ============================================
  // Cron: Check obligations & create notifications
  // ============================================
  async processScheduledNotifications() {
    const now = new Date();
    const pending = await this.prisma.notification.findMany({
      where: {
        status: 'pending',
        scheduledFor: { lte: now },
      },
      take: 100,
    });

    if (pending.length === 0) return { processed: 0 };

    this.logger.log(`📬 Processing ${pending.length} pending notifications`);

    for (const notif of pending) {
      // در فاز بعد: ارسال SMS یا پوش
      // فعلاً فقط status را sent می‌کنیم
      await this.prisma.notification.update({
        where: { id: notif.id },
        data: { status: 'sent', sentAt: new Date() },
      });
    }

    return { processed: pending.length };
  }

  async checkObligationReminders() {
    const now = new Date();
    const obligations = await this.prisma.obligation.findMany({
      where: {
        status: 'active',
        completedAt: null,
      },
    });

    let created = 0;

    for (const ob of obligations) {
      const alertDays = ob.alertDays || [30, 7, 1];
      const dueDate = new Date(ob.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // اگر یکی از alertDays با امروز منطبق بود
      if (alertDays.includes(diffDays)) {
        // چک کن قبلاً ساخته نشده
        const existing = await this.prisma.notification.findFirst({
          where: {
            userId: ob.userId,
            referenceId: ob.id,
            referenceType: 'obligation',
            createdAt: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            },
          },
        });

        if (!existing) {
          await this.prisma.notification.create({
            data: {
              userId: ob.userId,
              type: 'obligation',
              title: `${ob.title} — ${diffDays} روز دیگر`,
              body: ob.description || 'تعهد شما نزدیک است',
              priority: ob.priority,
              referenceId: ob.id,
              referenceType: 'obligation',
              scheduledFor: now,
              status: 'sent',
              sentAt: now,
            },
          });
          created++;
        }
      }
    }

    if (created > 0) {
      this.logger.log(`📬 Created ${created} obligation reminders`);
    }

    return { created };
  }
}
