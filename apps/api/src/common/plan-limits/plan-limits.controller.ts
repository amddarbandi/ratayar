import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard';
import { PlanLimitsService } from './plan-limits.service';

@ApiTags('plan')
@Controller('plan')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PlanLimitsController {
  constructor(private readonly planLimits: PlanLimitsService) {}

  @Get('usage')
  getUsage(@Req() req: any) {
    return this.planLimits.getPlanUsage(req.user.userId);
  }
}
