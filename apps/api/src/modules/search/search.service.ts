import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, query: string, limit = 20) {
    if (!query || query.trim().length < 2) {
      return { results: [], total: 0 };
    }

    const q = query.trim();

    const [obligations, assets, documents, transactions, familyMembers] =
      await Promise.all([
        // Obligations
        this.prisma.obligation.findMany({
          where: {
            userId,
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
          orderBy: { dueDate: 'asc' },
        }),

        // Assets
        this.prisma.asset.findMany({
          where: {
            userId,
            deletedAt: null,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { model: { contains: q, mode: 'insensitive' } },
              { notes: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),

        // Documents
        this.prisma.document.findMany({
          where: {
            userId,
            deletedAt: null,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { ocrText: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
        }),

        // Transactions
        this.prisma.transaction.findMany({
          where: {
            userId,
            deletedAt: null,
            OR: [
              { description: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: 5,
          orderBy: { date: 'desc' },
        }),

        // Family members
        this.prisma.familyMember
          .findMany({
            where: { userId },
            include: {
              family: {
                include: {
                  members: {
                    include: {
                      user: {
                        select: { fullName: true, phone: true },
                      },
                    },
                  },
                },
              },
            },
          })
          .catch(() => []),
      ]);

    const results = [
      ...obligations.map((o) => ({
        id: o.id,
        type: 'obligation',
        title: o.title,
        subtitle: o.description || 'تعهد',
        url: `/dashboard/obligations`,
        icon: 'Calendar',
        color: 'purple',
      })),
      ...assets.map((a) => ({
        id: a.id,
        type: 'asset',
        title: a.name,
        subtitle: a.model || `ارزش: ${a.currentValue || 0}`,
        url: `/dashboard/assets`,
        icon: 'Package',
        color: 'cyan',
      })),
      ...documents.map((d) => ({
        id: d.id,
        type: 'document',
        title: d.name,
        subtitle: d.type,
        url: `/dashboard/documents`,
        icon: 'FileText',
        color: 'emerald',
      })),
      ...transactions.map((t) => ({
        id: t.id,
        type: 'transaction',
        title: t.description || t.category,
        subtitle: t.type === 'income' ? 'درآمد' : 'هزینه',
        url: `/dashboard/finance`,
        icon: 'Wallet',
        color: 'orange',
      })),
      // Family members (all members from user's family)
      ...(familyMembers as any[])
        .flatMap((fm: any) => fm.family?.members || [])
        .filter((m: any) =>
          m.user?.fullName?.toLowerCase().includes(q.toLowerCase()),
        )
        .map((m: any) => ({
          id: m.id,
          type: 'family',
          title: m.user?.fullName,
          subtitle: m.relation || m.role,
          url: `/dashboard/family`,
          icon: 'Users',
          color: 'pink',
        })),
    ];

    return {
      results: results.slice(0, limit),
      total: results.length,
      query: q,
    };
  }
}
