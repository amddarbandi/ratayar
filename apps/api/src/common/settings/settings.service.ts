import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Central access to PlatformSetting values, with a simple
 * in-memory cache (30s TTL) to avoid hammering DB on every request.
 */
@Injectable()
export class PlatformSettingsService {
  private readonly logger = new Logger(PlatformSettingsService.name);
  private cache = new Map<string, { value: any; expiresAt: number }>();
  private readonly TTL_MS = 30_000;

  constructor(private readonly prisma: PrismaService) {}

  async get<T = any>(key: string, fallback: T): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }
    try {
      const row = await this.prisma.platformSetting.findUnique({
        where: { key },
      });
      const value = row ? (row.value as T) : fallback;
      this.cache.set(key, { value, expiresAt: Date.now() + this.TTL_MS });
      return value;
    } catch (e: any) {
      this.logger.warn(`settings.get ${key} failed: ${e.message}`);
      return fallback;
    }
  }

  async set(key: string, value: any, actorId?: string): Promise<void> {
    await this.prisma.platformSetting.upsert({
      where: { key },
      create: { key, value, updatedBy: actorId },
      update: { value, updatedBy: actorId },
    });
    this.cache.delete(key);
  }

  async invalidate(key?: string) {
    if (key) this.cache.delete(key);
    else this.cache.clear();
  }
}
