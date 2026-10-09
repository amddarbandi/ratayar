import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MarketService } from './market.service';

@Injectable()
export class MarketTasks {
  private readonly logger = new Logger(MarketTasks.name);

  constructor(private readonly market: MarketService) {}

  /** Refresh the cache every 60s so users always get warm data. */
  @Cron(CronExpression.EVERY_MINUTE)
  async refreshCache() {
    try {
      await this.market.getPrices(false);
    } catch (e: any) {
      this.logger.warn(`refreshCache failed: ${e.message}`);
    }
  }

  /** Write a snapshot every 5 minutes for history charts. */
  @Cron('0 */5 * * * *')
  async writeSnapshot() {
    try {
      await this.market.writeSnapshots();
    } catch (e: any) {
      this.logger.warn(`writeSnapshot failed: ${e.message}`);
    }
  }
}
