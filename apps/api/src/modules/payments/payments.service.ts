import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MinioService } from '../../common/minio/minio.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';

const MAX_RECEIPT_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_RECEIPT_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly subs: SubscriptionsService,
  ) {}

  async create(
    userId: string,
    file: Express.Multer.File,
    planId: string,
    months: number = 1,
    trackingCode?: string,
  ) {
    if (!file) throw new BadRequestException('رسید پرداخت ارسال نشده');
    if (file.size > MAX_RECEIPT_SIZE) {
      throw new BadRequestException('حجم رسید نباید بیشتر از ۵ مگابایت باشد');
    }
    if (!ALLOWED_RECEIPT_MIMES.includes(file.mimetype)) {
      throw new BadRequestException('فرمت رسید مجاز نیست (jpg/png/webp/pdf)');
    }
    if (months < 1 || months > 12) {
      throw new BadRequestException('مدت اشتراک باید بین ۱ تا ۱۲ ماه باشد');
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('پلن یافت نشد یا غیرفعال است');
    }
    if (plan.code === 'free') {
      throw new BadRequestException('پلن رایگان نیاز به پرداخت ندارد');
    }

    const pending = await this.prisma.paymentRequest.findFirst({
      where: { userId, status: 'pending' },
    });
    if (pending) {
      throw new BadRequestException(
        'شما یک درخواست پرداخت در انتظار تأیید دارید',
      );
    }

    // Upload receipt to MinIO
    const hash = createHash('sha256').update(file.buffer).digest('hex');
    const ext = (file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const receiptKey = `receipts/${userId}/${Date.now()}-${hash.slice(0, 8)}.${ext}`;
    await this.minio.uploadFile(
      receiptKey,
      file.buffer,
      file.mimetype,
      file.size,
    );

    const amount = plan.priceMonthly * BigInt(months);

    const payment = await this.prisma.paymentRequest.create({
      data: {
        userId,
        planId: plan.id,
        amount,
        method: 'card_to_card',
        receiptKey,
        receiptMime: file.mimetype,
        trackingCode: trackingCode || null,
        status: 'pending',
      },
      include: { plan: true },
    });

    // Auto-ticket for admin panel
    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        subject: `درخواست پرداخت — پلن ${plan.name}`,
        category: 'payment',
        priority: 'normal',
        status: 'open',
        referenceId: payment.id,
        referenceType: 'payment_request',
        messages: {
          create: {
            senderId: userId,
            senderRole: 'user',
            body:
              `درخواست ارتقا به پلن «${plan.name}» برای ${months} ماه.\n` +
              `مبلغ: ${amount.toString()} تومان\n` +
              (trackingCode ? `کد پیگیری: ${trackingCode}` : ''),
          },
        },
      },
    });

    this.logger.log(
      `✅ Payment request created: ${payment.id} (ticket ${ticket.id})`,
    );
    return { payment: this.serialize(payment), ticketId: ticket.id };
  }

  async listMine(userId: string) {
    const items = await this.prisma.paymentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { plan: true },
    });
    return items.map((p) => this.serialize(p));
  }

  async listAll(opts?: { status?: string; limit?: number }) {
    const items = await this.prisma.paymentRequest.findMany({
      where: opts?.status ? { status: opts.status } : undefined,
      orderBy: { createdAt: 'desc' },
      take: opts?.limit ?? 100,
      include: {
        plan: true,
        user: { select: { id: true, phone: true, fullName: true } },
      },
    });
    return items.map((p) => ({
      ...this.serialize(p),
      user: (p as any).user,
    }));
  }

  async approve(adminId: string, id: string, adminNote?: string) {
    const payment = await this.prisma.paymentRequest.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!payment) throw new NotFoundException('درخواست پرداخت یافت نشد');
    if (payment.status !== 'pending') {
      throw new BadRequestException('این درخواست قبلاً بررسی شده است');
    }

    // months derived from amount / priceMonthly
    const months =
      payment.plan.priceMonthly > BigInt(0)
        ? Number(payment.amount / payment.plan.priceMonthly)
        : 1;

    await this.subs.activate(payment.userId, payment.planId, months || 1);

    const updated = await this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'approved',
        adminNote: adminNote || null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: { plan: true },
    });

    await this.closeTicketForPayment(
      id,
      adminId,
      'approved',
      payment.plan.name,
      months || 1,
      adminNote,
    );

    this.logger.log(`✅ Payment approved: ${id} by admin ${adminId}`);
    return this.serialize(updated);
  }

  async reject(adminId: string, id: string, adminNote?: string) {
    const payment = await this.prisma.paymentRequest.findUnique({
      where: { id },
      include: { plan: true },
    });
    if (!payment) throw new NotFoundException('درخواست پرداخت یافت نشد');
    if (payment.status !== 'pending') {
      throw new BadRequestException('این درخواست قبلاً بررسی شده است');
    }

    const updated = await this.prisma.paymentRequest.update({
      where: { id },
      data: {
        status: 'rejected',
        adminNote: adminNote || null,
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
      include: { plan: true },
    });

    await this.closeTicketForPayment(
      id,
      adminId,
      'rejected',
      payment.plan.name,
      0,
      adminNote,
    );

    this.logger.log(`❌ Payment rejected: ${id} by admin ${adminId}`);
    return this.serialize(updated);
  }

  private async closeTicketForPayment(
    paymentId: string,
    adminId: string,
    status: 'approved' | 'rejected',
    planName: string,
    months: number,
    adminNote?: string,
  ) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { referenceId: paymentId, referenceType: 'payment_request' },
    });
    if (!ticket) return;

    const body =
      status === 'approved'
        ? `✅ پرداخت شما تأیید شد. پلن «${planName}» برای ${months} ماه فعال شد.`
        : `❌ پرداخت شما رد شد.${adminNote ? `\nدلیل: ${adminNote}` : ''}`;

    await this.prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: adminId,
        senderRole: 'admin',
        body,
      },
    });

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'closed', closedAt: new Date() },
    });
  }

  private serialize(p: any) {
    return {
      id: p.id,
      amount: p.amount?.toString(),
      method: p.method,
      receiptKey: p.receiptKey,
      receiptMime: p.receiptMime,
      trackingCode: p.trackingCode,
      status: p.status,
      adminNote: p.adminNote,
      reviewedAt: p.reviewedAt,
      createdAt: p.createdAt,
      plan: p.plan
        ? {
            id: p.plan.id,
            code: p.plan.code,
            name: p.plan.name,
            priceMonthly: p.plan.priceMonthly?.toString(),
          }
        : null,
    };
  }
}
