import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard-summary')
  getDashboardSummary(@Req() req: any) {
    return this.reports.getDashboardSummary(req.user.userId);
  }

  @Get('overview')
  getOverview(@Req() req: any) {
    return this.reports.getOverview(req.user.userId);
  }

  @Get('discipline-history')
  getDisciplineHistory(@Req() req: any, @Query('months') months?: string) {
    return this.reports.getDisciplineHistory(
      req.user.userId,
      months ? parseInt(months) : 6,
    );
  }

  @Get('obligations-by-category')
  getObligationsByCategory(@Req() req: any) {
    return this.reports.getObligationsByCategory(req.user.userId);
  }

  @Get('yearly-summary')
  getYearlySummary(@Req() req: any) {
    return this.reports.getYearlySummary(req.user.userId);
  }
}
