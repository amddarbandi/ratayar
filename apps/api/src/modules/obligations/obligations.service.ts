import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateObligationDto } from './dto/create-obligation.dto';
import { UpdateObligationDto } from './dto/update-obligation.dto';

@Injectable()
export class ObligationsService {
  private readonly logger = new Logger(ObligationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateObligationDto) {
    const obligation = await this.prisma.obligation.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
        category: dto.category || 'life',
        priority: dto.priority || 'normal',
        repeatType: dto.repeatType || 'once',
        repeatInterval: dto.repeatInterval,
        alertDays: dto.alertDays || [30, 7, 1],
      },
    });
    this.logger.log(`✅ Obligation created: ${obligation.title}`);
    return obligation;
  }

  async findAll(userId: string, filters?: { status?: string; category?: string }) {
    const where: any = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;

    return this.prisma.obligation.findMany({
      where,
      orderBy: { dueDate: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const obligation = await this.prisma.obligation.findUnique({ where: { id } });
    if (!obligation) throw new NotFoundException('تعهد یافت نشد');
    if (obligation.userId !== userId) throw new ForbiddenException('دسترسی ندارید');
    return obligation;
  }

  async update(userId: string, id: string, dto: UpdateObligationDto) {
    await this.findOne(userId, id);
    const data: any = { ...dto };
    if (dto.dueDate) data.dueDate = new Date(dto.dueDate);
    return this.prisma.obligation.update({ where: { id }, data });
  }

  async complete(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.obligation.update({
      where: { id },
      data: { status: 'completed', completedAt: new Date() },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.obligation.delete({ where: { id } });
    return { success: true };
  }

  async getToday(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return this.prisma.obligation.findMany({
      where: {
        userId,
        dueDate: { gte: start, lte: end },
        status: { not: 'completed' },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getUpcoming(userId: string, days = 30) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days);
    return this.prisma.obligation.findMany({
      where: {
        userId,
        dueDate: { gte: start, lte: end },
        status: { not: 'completed' },
      },
      orderBy: { dueDate: 'asc' },
      take: 20,
    });
  }

  async getStats(userId: string) {
    const [total, active, completed, overdue] = await Promise.all([
      this.prisma.obligation.count({ where: { userId } }),
      this.prisma.obligation.count({ where: { userId, status: 'active' } }),
      this.prisma.obligation.count({ where: { userId, status: 'completed' } }),
      this.prisma.obligation.count({
        where: { userId, dueDate: { lt: new Date() }, status: { not: 'completed' } },
      }),
    ]);
    return { total, active, completed, overdue };
  }
}
