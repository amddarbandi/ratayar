import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../common/redis/redis.service';

const CACHE_KEY = 'market:prices';
const TTL_SECONDS = 60;

@Injectable()
export class MarketCacheService {
  private readonly logger = new Logger(MarketCacheService.name);

  constructor(private readonly redis: RedisService) {}

  async get<T = any>(): Promise<T | null> {
    try {
      const raw = await this.redis.get(CACHE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (e: any) {
      this.logger.warn(`cache get failed: ${e.message}`);
      return null;
    }
  }

  async set(data: any): Promise<void> {
    try {
      await this.redis.set(CACHE_KEY, JSON.stringify(data), TTL_SECONDS);
    } catch (e: any) {
      this.logger.warn(`cache set failed: ${e.message}`);
    }
  }

  async invalidate(): Promise<void> {
    try {
      await this.redis.del(CACHE_KEY);
    } catch {}
  }
}
