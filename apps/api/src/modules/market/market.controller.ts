import { Controller, Get, UseGuards } from '@nestjs/common';
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
}
