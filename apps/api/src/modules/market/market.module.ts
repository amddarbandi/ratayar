import { Module } from '@nestjs/common';
import { MarketService } from './market.service';
import { MarketController } from './market.controller';
import { MarketCacheService } from './market-cache.service';
import { MarketTasks } from './market.tasks';
import { TgjuProvider } from './providers/tgju.provider';
import { WallexProvider } from './providers/wallex.provider';
import { CoinGeckoProvider } from './providers/coingecko.provider';

@Module({
  controllers: [MarketController],
  providers: [
    MarketService,
    MarketCacheService,
    MarketTasks,
    TgjuProvider,
    WallexProvider,
    CoinGeckoProvider,
  ],
  exports: [MarketService],
})
export class MarketModule {}
