import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditWrite {
  actorId?: string | null;
  actorPhone?: string | null;
  actorRole?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  meta?: any;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async write(entry: AuditWrite) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: entry.actorId ?? null,
          actorPhone: entry.actorPhone ?? null,
          actorRole: entry.actorRole ?? null,
          action: entry.action,
          targetType: entry.targetType ?? null,
          targetId: entry.targetId ?? null,
          meta: entry.meta ?? {},
          ip: entry.ip ?? null,
          userAgent: entry.userAgent
            ? entry.userAgent.slice(0, 300)
            : null,
        },
      });
    } catch (e: any) {
      // Never let audit failures break the actual operation
      this.logger.warn(`audit write failed: ${e.message}`);
    }
  }

  async list(opts: {
    limit?: number;
    offset?: number;
    action?: string;
    actorId?: string;
    targetType?: string;
    targetId?: string;
  }) {
    const where: any = {};
    if (opts.action) where.action = { contains: opts.action };
    if (opts.actorId) where.actorId = opts.actorId;
    if (opts.targetType) where.targetType = opts.targetType;
    if (opts.targetId) where.targetId = opts.targetId;

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: opts.limit ?? 50,
        skip: opts.offset ?? 0,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }
}
