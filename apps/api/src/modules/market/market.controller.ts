import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketService } from './market.service';

@ApiTags('market')
@Controller('market')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Get('prices')
  getPrices() {
    return this.market.getPrices();
  }

  @Get('history/:symbol')
  getHistory(
    @Param('symbol') symbol: string,
    @Query('days') days?: string,
  ) {
    return this.market.getHistory(
      symbol,
      days ? Math.max(1, Math.min(365, parseInt(days, 10))) : 30,
    );
  }
}
