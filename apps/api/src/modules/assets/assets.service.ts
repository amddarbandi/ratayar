import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PlanLimitsService } from '../../common/plan-limits/plan-limits.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async create(userId: string, dto: CreateAssetDto) {
    await this.planLimits.checkAssetLimit(userId);
    const asset = await this.prisma.asset.create({
      data: {
        userId,
        type: dto.type,
        name: dto.name,
        model: dto.model,
        year: dto.year,
        purchasePrice: dto.purchasePrice ? BigInt(dto.purchasePrice) : null,
        currentValue: dto.currentValue ? BigInt(dto.currentValue) : null,
        notes: dto.notes,
      },
    });
    this.logger.log(`✅ Asset created: ${asset.name}`);
    return this.serializeAsset(asset);
  }

  async findAll(userId: string, filters?: { type?: string; status?: string }) {
    const where: any = { userId, deletedAt: null };
    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    const assets = await this.prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((a) => this.serializeAsset(a));
  }

  async findOne(userId: string, id: string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset || asset.deletedAt) throw new NotFoundException('دارایی یافت نشد');
    if (asset.userId !== userId) throw new ForbiddenException('دسترسی ندارید');
    return this.serializeAsset(asset);
  }

  async update(userId: string, id: string, dto: UpdateAssetDto) {
    await this.findOne(userId, id);
    const data: any = { ...dto };
    if (dto.purchasePrice !== undefined) data.purchasePrice = BigInt(dto.purchasePrice);
    if (dto.currentValue !== undefined) data.currentValue = BigInt(dto.currentValue);
    const asset = await this.prisma.asset.update({ where: { id }, data });
    return this.serializeAsset(asset);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.asset.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'deleted' },
    });
    return { success: true };
  }

  async getStats(userId: string) {
    const assets = await this.prisma.asset.findMany({
      where: { userId, deletedAt: null, status: 'active' },
    });

    const totalValue = assets.reduce(
      (sum, a) => sum + Number(a.currentValue || 0),
      0,
    );

    const byType: Record<string, number> = {};
    assets.forEach((a) => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });

    return {
      total: assets.length,
      totalValue,
      byType,
    };
  }

  private serializeAsset(asset: any) {
    return {
      ...asset,
      purchasePrice: asset.purchasePrice ? Number(asset.purchasePrice) : null,
      currentValue: asset.currentValue ? Number(asset.currentValue) : null,
    };
  }
}
