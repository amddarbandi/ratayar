import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { MinioService } from '../../common/minio/minio.service';
import { PlanLimitsService } from '../../common/plan-limits/plan-limits.service';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
];

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly planLimits: PlanLimitsService,
  ) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
    type: string,
    name?: string,
    expiresAt?: string,
  ) {
    if (!file) throw new BadRequestException('فایلی ارسال نشده');

    // Plan-based enforcement (format + per-file + count + storage)
    await this.planLimits.checkDocumentLimit(userId, file);

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `حجم فایل نباید بیشتر از ${MAX_FILE_SIZE / 1024 / 1024} مگابایت باشد`,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('نوع فایل مجاز نیست');
    }

    // SHA-256 hash
    const hash = createHash('sha256').update(file.buffer).digest('hex');

    // Storage key
    const ext = file.originalname.split('.').pop() || 'bin';
    const storageKey = `${userId}/${type}/${Date.now()}-${hash.slice(0, 8)}.${ext}`;

    // Upload to MinIO
    await this.minio.uploadFile(
      storageKey,
      file.buffer,
      file.mimetype,
      file.size,
    );

    // Save metadata in DB
    const doc = await this.prisma.document.create({
      data: {
        userId,
        name: name || file.originalname,
        type,
        mimeType: file.mimetype,
        size: BigInt(file.size),
        storageKey,
        hash,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    this.logger.log(`✅ Document uploaded: ${doc.name}`);
    return this.serialize(doc);
  }

  async findAll(userId: string, filters?: { type?: string }) {
    const where: any = { userId, deletedAt: null };
    if (filters?.type) where.type = filters.type;

    const docs = await this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return docs.map((d) => this.serialize(d));
  }

  async findOne(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) throw new NotFoundException('سند یافت نشد');
    if (doc.userId !== userId) throw new ForbiddenException('دسترسی ندارید');
    return this.serialize(doc);
  }

  async getDownloadUrl(userId: string, id: string, inline = false) {
    const doc = await this.findOne(userId, id);

    // Get presigned URL with proper response headers
    const url = await this.minio.getPresignedUrlWithHeaders(
      doc.storageKey,
      3600,
      {
        'response-content-type': doc.mimeType,
        'response-content-disposition': `${inline ? 'inline' : 'attachment'}; filename="${encodeURIComponent(doc.name)}"`,
      },
    );

    return {
      url,
      expiresIn: 3600,
      name: doc.name,
      mimeType: doc.mimeType,
      size: doc.size,
    };
  }

  async remove(userId: string, id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc || doc.deletedAt) throw new NotFoundException('سند یافت نشد');
    if (doc.userId !== userId) throw new ForbiddenException('دسترسی ندارید');

    // Soft delete in DB
    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { success: true };
  }

  async getStats(userId: string) {
    const docs = await this.prisma.document.findMany({
      where: { userId, deletedAt: null },
    });

    const totalSize = docs.reduce((sum, d) => sum + Number(d.size), 0);
    const byType: Record<string, number> = {};
    docs.forEach((d) => {
      byType[d.type] = (byType[d.type] || 0) + 1;
    });

    return {
      total: docs.length,
      totalSize,
      byType,
    };
  }

  async stream(userId: string, id: string) {
    const doc = await this.findOne(userId, id);
    const buffer = await this.minio.getFile(doc.storageKey);
    return {
      buffer,
      mimeType: doc.mimeType,
      name: doc.name,
      size: doc.size,
    };
  }

  private serialize(doc: any) {
    return {
      ...doc,
      size: Number(doc.size),
    };
  }
}
