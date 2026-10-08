import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

const VALID_CATEGORIES = ['bug', 'feature', 'billing', 'payment', 'other'];
const VALID_PRIORITIES = ['low', 'normal', 'high', 'urgent'];
const VALID_STATUSES = ['open', 'answered', 'pending_user', 'closed'];

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    subject: string,
    category: string,
    priority: string,
    body: string,
  ) {
    if (!subject || subject.trim().length < 3) {
      throw new BadRequestException('موضوع تیکت الزامی است');
    }
    if (!body || body.trim().length < 5) {
      throw new BadRequestException('متن تیکت الزامی است');
    }
    if (!VALID_CATEGORIES.includes(category)) category = 'other';
    if (!VALID_PRIORITIES.includes(priority)) priority = 'normal';

    const ticket = await this.prisma.ticket.create({
      data: {
        userId,
        subject: subject.trim().slice(0, 200),
        category,
        priority,
        status: 'open',
        messages: {
          create: {
            senderId: userId,
            senderRole: 'user',
            body: body.trim(),
          },
        },
      },
      include: { messages: true },
    });

    this.logger.log(`✅ Ticket created: ${ticket.id} by user ${userId}`);
    return this.serialize(ticket);
  }

  async listMine(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
      },
    });
    return tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      messageCount: t._count.messages,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      closedAt: t.closedAt,
    }));
  }

  async getOne(userId: string, id: string, isAdmin: boolean) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                phone: true,
                role: true,
              },
            },
          },
        },
        user: {
          select: { id: true, phone: true },
        },
      },
    });
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');
    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('دسترسی ندارید');
    }
    return this.serializeFull(ticket);
  }

  async addMessage(
    userId: string,
    ticketId: string,
    body: string,
    isAdmin: boolean,
  ) {
    if (!body || body.trim().length < 2) {
      throw new BadRequestException('متن پیام الزامی است');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');
    if (!isAdmin && ticket.userId !== userId) {
      throw new ForbiddenException('دسترسی ندارید');
    }
    if (ticket.status === 'closed') {
      throw new BadRequestException('این تیکت بسته شده است');
    }

    const message = await this.prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: userId,
        senderRole: isAdmin ? 'admin' : 'user',
        body: body.trim(),
      },
    });

    // status flow
    const newStatus = isAdmin
      ? 'answered'
      : ticket.status === 'answered' || ticket.status === 'pending_user'
        ? 'open'
        : ticket.status;

    await this.prisma.ticket.update({
      where: { id: ticketId },
      data: { status: newStatus },
    });

    this.logger.log(
      `✅ Ticket message added: ${message.id} (ticket ${ticketId}, ${isAdmin ? 'admin' : 'user'})`,
    );
    return {
      id: message.id,
      body: message.body,
      senderRole: message.senderRole,
      createdAt: message.createdAt,
      newStatus,
    };
  }

  async adminListAll(opts?: { status?: string; limit?: number }) {
    const tickets = await this.prisma.ticket.findMany({
      where: opts?.status ? { status: opts.status } : undefined,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: opts?.limit ?? 100,
      include: {
        user: { select: { id: true, phone: true } },
        _count: { select: { messages: true } },
      },
    });
    return tickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      referenceType: t.referenceType,
      referenceId: t.referenceId,
      messageCount: t._count.messages,
      user: (t as any).user,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));
  }

  async adminSetStatus(
    id: string,
    status: string,
    adminId: string,
    note?: string,
  ) {
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestException('وضعیت نامعتبر است');
    }
    const ticket = await this.prisma.ticket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');

    if (note && note.trim().length > 0) {
      await this.prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: adminId,
          senderRole: 'admin',
          body: note.trim(),
        },
      });
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status,
        closedAt: status === 'closed' ? new Date() : null,
      },
    });
    this.logger.log(`✅ Ticket ${id} status -> ${status} by admin ${adminId}`);
    return {
      id: updated.id,
      status: updated.status,
      closedAt: updated.closedAt,
      updatedAt: updated.updatedAt,
    };
  }

  private serialize(t: any) {
    return {
      id: t.id,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      messageCount: t.messages?.length ?? 0,
    };
  }

  private serializeFull(t: any) {
    return {
      id: t.id,
      subject: t.subject,
      category: t.category,
      priority: t.priority,
      status: t.status,
      referenceType: t.referenceType,
      referenceId: t.referenceId,
      user: t.user,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      closedAt: t.closedAt,
      messages: (t.messages || []).map((m: any) => ({
        id: m.id,
        body: m.body,
        senderRole: m.senderRole,
        sender: m.sender
          ? { id: m.sender.id, phone: m.sender.phone, role: m.sender.role }
          : null,
        attachments: m.attachments,
        createdAt: m.createdAt,
      })),
    };
  }
}
