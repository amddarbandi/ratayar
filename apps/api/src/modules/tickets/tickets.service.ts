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

  async adminListAll(opts?: {
    status?: string;
    assignedTo?: string;
    unassigned?: boolean;
    limit?: number;
  }) {
    const where: any = {};
    if (opts?.status) where.status = opts.status;
    if (opts?.unassigned) where.assigneeId = null;
    else if (opts?.assignedTo) where.assigneeId = opts.assignedTo;

    const tickets = await this.prisma.ticket.findMany({
      where,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take: opts?.limit ?? 100,
      include: {
        user: { select: { id: true, phone: true } },
        assignee: { select: { id: true, phone: true, fullName: true } },
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
      assigneeId: t.assigneeId,
      assignee: (t as any).assignee,
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

  // ═══════════════════════════════════════════
  // Assignment
  // ═══════════════════════════════════════════
  async adminAssign(ticketId: string, assigneeId: string | null) {
    const ticket = await this.prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('تیکت یافت نشد');

    if (assigneeId) {
      const user = await this.prisma.user.findUnique({
        where: { id: assigneeId },
        select: { id: true, role: true },
      });
      if (!user || !['admin', 'support'].includes(user.role)) {
        throw new BadRequestException('ادمین/پشتیبان انتخاب‌شده معتبر نیست');
      }
    }

    const updated = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: {
        assigneeId,
        assignedAt: assigneeId ? new Date() : null,
      },
      include: {
        assignee: { select: { id: true, phone: true, fullName: true } },
      },
    });

    this.logger.log(
      `✅ Ticket ${ticketId} ${assigneeId ? 'assigned to ' + assigneeId : 'unassigned'}`,
    );
    return {
      id: updated.id,
      assigneeId: updated.assigneeId,
      assignedAt: updated.assignedAt,
      assignee: (updated as any).assignee,
    };
  }

  async adminListAdmins() {
    const admins = await this.prisma.user.findMany({
      where: { role: { in: ['admin', 'support'] }, deletedAt: null },
      select: { id: true, phone: true, fullName: true, role: true },
      orderBy: { fullName: 'asc' },
    });
    return { items: admins };
  }

  // ═══════════════════════════════════════════
  // Macros
  // ═══════════════════════════════════════════
  async listMacros() {
    const items = await this.prisma.ticketMacro.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { items };
  }

  async createMacro(
    name: string,
    body: string,
    category: string,
    actorId: string,
  ) {
    if (!name || name.trim().length < 2) throw new BadRequestException('نام الزامی است');
    if (!body || body.trim().length < 2) throw new BadRequestException('متن الزامی است');
    const macro = await this.prisma.ticketMacro.create({
      data: {
        name: name.trim(),
        body: body.trim(),
        category: category || 'other',
        createdBy: actorId,
      },
    });
    return macro;
  }

  async updateMacro(
    id: string,
    data: { name?: string; body?: string; category?: string },
  ) {
    return this.prisma.ticketMacro.update({
      where: { id },
      data: {
        name: data.name ?? undefined,
        body: data.body ?? undefined,
        category: data.category ?? undefined,
      },
    });
  }

  async deleteMacro(id: string) {
    await this.prisma.ticketMacro.delete({ where: { id } });
    return { ok: true };
  }

}
