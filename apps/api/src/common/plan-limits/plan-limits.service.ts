import { Injectable, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const UNLIMITED = -1;

@Injectable()
export class PlanLimitsService {
  private readonly logger = new Logger(PlanLimitsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getActivePlan(userId: string) {
    const sub = await this.prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { startedAt: 'desc' },
      include: { plan: true },
    });
    if (sub) return sub.plan;

    const freePlan = await this.prisma.plan.findUnique({
      where: { code: 'free' },
    });
    if (!freePlan) {
      throw new ForbiddenException('پلن رایگان تعریف نشده است');
    }
    return freePlan;
  }

  private isUnlimited(limit: number) {
    return limit === UNLIMITED;
  }

  async checkObligationLimit(userId: string) {
    const plan = await this.getActivePlan(userId);
    if (this.isUnlimited(plan.maxObligations)) return;

    const count = await this.prisma.obligation.count({
      where: { userId },
    });
    if (count >= plan.maxObligations) {
      throw new ForbiddenException(
        `به سقف تعداد تعهدات پلن «${plan.name}» (${plan.maxObligations}) رسیده‌اید. برای افزایش، پلن خود را ارتقا دهید.`,
      );
    }
  }

  async checkAssetLimit(userId: string) {
    const plan = await this.getActivePlan(userId);
    if (this.isUnlimited(plan.maxAssets)) return;

    const count = await this.prisma.asset.count({ where: { userId } });
    if (count >= plan.maxAssets) {
      throw new ForbiddenException(
        `به سقف تعداد دارایی‌های پلن «${plan.name}» (${plan.maxAssets}) رسیده‌اید. برای افزایش، پلن خود را ارتقا دهید.`,
      );
    }
  }

  async checkDocumentLimit(userId: string, file: Express.Multer.File) {
    const plan = await this.getActivePlan(userId);

    // 1) format whitelist by extension
    if (plan.allowedFormats && plan.allowedFormats.length > 0) {
      const ext = (file.originalname.split('.').pop() || '').toLowerCase();
      const allowed = plan.allowedFormats.map((f) => f.toLowerCase());
      if (!allowed.includes(ext)) {
        throw new ForbiddenException(
          `فرمت «${ext}» در پلن «${plan.name}» مجاز نیست. فرمت‌های مجاز: ${plan.allowedFormats.join(', ')}`,
        );
      }
    }

    // 2) per-file size
    const maxUploadBytes = plan.maxUploadMB * 1024 * 1024;
    if (file.size > maxUploadBytes) {
      throw new ForbiddenException(
        `حجم فایل نباید بیشتر از ${plan.maxUploadMB} مگابایت باشد (پلن «${plan.name}»). برای آپلود بزرگ‌تر، پلن را ارتقا دهید.`,
      );
    }

    // 3) count
    if (!this.isUnlimited(plan.maxDocuments)) {
      const count = await this.prisma.document.count({
        where: { userId, deletedAt: null },
      });
      if (count >= plan.maxDocuments) {
        throw new ForbiddenException(
          `به سقف تعداد اسناد پلن «${plan.name}» (${plan.maxDocuments}) رسیده‌اید. برای افزایش، پلن خود را ارتقا دهید.`,
        );
      }
    }

    // 4) total storage
    const agg = await this.prisma.document.aggregate({
      where: { userId, deletedAt: null },
      _sum: { size: true },
    });
    const currentBytes = Number(agg._sum.size ?? BigInt(0));
    const limitBytes = plan.maxStorageMB * 1024 * 1024;
    if (currentBytes + file.size > limitBytes) {
      const currentMB = (currentBytes / 1024 / 1024).toFixed(1);
      throw new ForbiddenException(
        `فضای ذخیره‌سازی پلن «${plan.name}» (${plan.maxStorageMB} مگابایت) کافی نیست. مصرف فعلی: ${currentMB} مگابایت.`,
      );
    }
  }

  async getPlanUsage(userId: string) {
    const plan = await this.getActivePlan(userId);

    const [docCount, docAgg, obligCount, assetCount] = await Promise.all([
      this.prisma.document.count({ where: { userId, deletedAt: null } }),
      this.prisma.document.aggregate({
        where: { userId, deletedAt: null },
        _sum: { size: true },
      }),
      this.prisma.obligation.count({ where: { userId } }),
      this.prisma.asset.count({ where: { userId } }),
    ]);

    const usedStorageBytes = Number(docAgg._sum.size ?? BigInt(0));
    const limitBytes = plan.maxStorageMB * 1024 * 1024;
    const percent =
      limitBytes > 0
        ? Math.min(100, Math.round((usedStorageBytes / limitBytes) * 100))
        : 0;

    const warning =
      percent >= 100 ? 'full' : percent >= 80 ? 'high' : 'ok';

    return {
      plan: {
        code: plan.code,
        name: plan.name,
        maxDocuments: plan.maxDocuments,
        maxObligations: plan.maxObligations,
        maxAssets: plan.maxAssets,
        maxStorageMB: plan.maxStorageMB,
        maxUploadMB: plan.maxUploadMB,
        allowedFormats: plan.allowedFormats,
      },
      usage: {
        documents: docCount,
        obligations: obligCount,
        assets: assetCount,
        storageBytes: usedStorageBytes,
        storageMB: +(usedStorageBytes / 1024 / 1024).toFixed(2),
      },
      limits: {
        storagePercent: percent,
        storageWarning: warning,
      },
    };
  }
}
