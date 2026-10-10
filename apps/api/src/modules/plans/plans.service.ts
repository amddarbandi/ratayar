import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================
  // Public: Get all active plans (ordered)
  // ============================================
  async getPublicPlans() {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return plans.map((p) => this.serialize(p));
  }

  // ============================================
  // Public: Get one plan by code
  // ============================================
  async getPlanByCode(code: string) {
    const plan = await this.prisma.plan.findUnique({ where: { code } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('پلن یافت نشد');
    }
    return this.serialize(plan);
  }

  // ============================================
  // Public: Get plan by ID
  // ============================================
  async getPlanById(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException('پلن یافت نشد');
    }
    return this.serialize(plan);
  }

  // ============================================
  // Admin: Get all plans (including inactive)
  // ============================================
  async getAllPlans() {
    const plans = await this.prisma.plan.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return plans.map((p) => this.serialize(p));
  }

  // ============================================
  // Admin: Create plan
  // ============================================
  async create(dto: CreatePlanDto) {
    const existing = await this.prisma.plan.findUnique({
      where: { code: dto.code },
    });
    if (existing) {
      throw new BadRequestException('پلنی با این کد قبلاً وجود دارد');
    }

    const plan = await this.prisma.plan.create({
      data: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        priceMonthly: BigInt(dto.priceMonthly),
        priceYearly: dto.priceYearly ? BigInt(dto.priceYearly) : null,
        maxMembers: dto.maxMembers,
        maxObligations: dto.maxObligations,
        maxAssets: dto.maxAssets,
        maxDocuments: dto.maxDocuments,
        maxStorageMB: dto.maxStorageMB,
        maxUploadMB: dto.maxUploadMB,
        features: dto.features ?? {},
        isActive: dto.isActive ?? true,
        isPopular: dto.isPopular ?? false,
        sortOrder: dto.sortOrder ?? 0,
      },
    });

    this.logger.log(`✅ Plan created: ${plan.code}`);
    return this.serialize(plan);
  }

  // ============================================
  // Admin: Update plan
  // ============================================
  async update(id: string, dto: UpdatePlanDto) {
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('پلن یافت نشد');
    }

    const data: any = { ...dto };
    if (dto.priceMonthly !== undefined) {
      data.priceMonthly = BigInt(dto.priceMonthly);
    }
    if (dto.priceYearly !== undefined) {
      data.priceYearly = dto.priceYearly === null ? null : BigInt(dto.priceYearly);
    }

    const plan = await this.prisma.plan.update({
      where: { id },
      data,
    });

    this.logger.log(`✅ Plan updated: ${plan.code}`);
    return this.serialize(plan);
  }

  // ============================================
  // Admin: Soft deactivate
  // ============================================
  async deactivate(id: string) {
    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('پلن یافت نشد');
    }

    const plan = await this.prisma.plan.update({
      where: { id },
      data: { isActive: false },
    });
    return this.serialize(plan);
  }

  // ============================================
  // Helper: BigInt → Number for JSON
  // ============================================
  private serialize(plan: any) {
    return {
      ...plan,
      priceMonthly: Number(plan.priceMonthly),
      priceYearly: plan.priceYearly !== null ? Number(plan.priceYearly) : null,
    };
  }
}
