import { Controller, Get, Post, Patch, Query, Param, Body, Req, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('overview')
  overview() {
    return this.admin.getOverview();
  }

  @Get('audit-log')
  auditLog(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('action') action?: string,
    @Query('actorId') actorId?: string,
    @Query('targetType') targetType?: string,
    @Query('targetId') targetId?: string,
  ) {
    return this.admin.listAudit({
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      action,
      actorId,
      targetType,
      targetId,
    });
  }

  // ═══════════════════════════════════════════
  // Users
  // ═══════════════════════════════════════════

  @Get('users')
  listUsers(
    @Query('q') q?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
    @Query('plan') plan?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.admin.listUsers({
      q,
      status,
      role,
      plan,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.admin.getUser(id);
    if (!user) throw new NotFoundException('کاربر یافت نشد');
    return user;
  }

  @Post('users/:id/ban')
  banUser(@Param('id') id: string) {
    return this.admin.banUser(id);
  }

  @Post('users/:id/unban')
  unbanUser(@Param('id') id: string) {
    return this.admin.unbanUser(id);
  }

  @Patch('users/:id/role')
  setUserRole(@Param('id') id: string, @Body('role') role: string) {
    if (!role) throw new BadRequestException('role الزامی است');
    return this.admin.setUserRole(id, role);
  }


  // ═══════════════════════════════════════════
  // Subscriptions
  // ═══════════════════════════════════════════
  @Get('subscriptions')
  listSubscriptions(
    @Query('status') status?: string,
    @Query('planCode') planCode?: string,
    @Query('expiringIn') expiringIn?: string,
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.admin.listSubscriptions({
      status,
      planCode,
      expiringIn: expiringIn ? parseInt(expiringIn, 10) : undefined,
      q,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Post('subscriptions/:id/extend')
  extendSubscription(
    @Param('id') id: string,
    @Body('months') months: number,
  ) {
    return this.admin.extendSubscription(id, Number(months) || 1);
  }

  @Post('subscriptions/:id/cancel')
  cancelSubscription(@Param('id') id: string) {
    return this.admin.cancelSubscription(id);
  }

  // ═══════════════════════════════════════════
  // Revenue
  // ═══════════════════════════════════════════
  @Get('revenue')
  getRevenue() {
    return this.admin.getRevenue();
  }

  // ═══════════════════════════════════════════
  // Refund
  // ═══════════════════════════════════════════
  @Post('payments/:id/refund')
  refundPayment(
    @Param('id') id: string,
    @Req() req: any,
    @Body('reason') reason?: string,
  ) {
    return this.admin.refundPayment(id, req.user.userId, reason || '');
  }

}
