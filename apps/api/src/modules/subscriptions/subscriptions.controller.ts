import {
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SubscriptionsController {
  constructor(private readonly subs: SubscriptionsService) {}

  @Get('me')
  getMine(@Req() req: any) {
    return this.subs.getActiveSubscription(req.user.userId);
  }

  @Get('history')
  getHistory(@Req() req: any) {
    return this.subs.getHistory(req.user.userId);
  }

  @Post('cancel')
  cancel(@Req() req: any) {
    return this.subs.cancel(req.user.userId);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  listAll(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.subs.listAll({
      status,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
