import { Controller, Get, Post, Patch, Delete, Query, Param, Body, Req, Res, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';
import { Audited } from '../../common/audit/audited.decorator';

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


  // ═══════════════════════════════════════════
  // Content oversight
  // ═══════════════════════════════════════════
  @Get('documents')
  listDocuments(
    @Query('q') q?: string,
    @Query('type') type?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.admin.listDocuments({
      q,
      type,
      userId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Delete('documents/:id')
  @Audited({ action: 'document.admin.delete', targetType: 'document' })
  deleteDocument(@Param('id') id: string) {
    return this.admin.deleteDocument(id);
  }

  @Get('obligations')
  listObligations(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('priority') priority?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.admin.listObligations({
      q,
      category,
      priority,
      userId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Post('obligations/bulk-delete')
  @Audited({ action: 'obligation.admin.bulk-delete', targetType: 'obligation' })
  bulkDeleteObligations(@Body('ids') ids: string[]) {
    return this.admin.bulkDeleteObligations(ids || []);
  }

  @Get('notifications')
  listNotifications(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.admin.listNotifications({
      status,
      userId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Post('notifications/:id/retry')
  @Audited({ action: 'notification.admin.retry', targetType: 'notification' })
  retryNotification(@Param('id') id: string) {
    return this.admin.retryNotification(id);
  }


  // ═══════════════════════════════════════════
  // Broadcasts
  // ═══════════════════════════════════════════
  @Get('broadcasts')
  listBroadcasts(
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.admin.listBroadcasts({
      status,
      channel,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Post('broadcasts')
  @Audited({ action: 'broadcast.admin.create', targetType: 'broadcast' })
  createBroadcast(@Req() req: any, @Body() dto: any) {
    return this.admin.createBroadcast(req.user.userId, dto);
  }


  // ═══════════════════════════════════════════
  // Platform Settings
  // ═══════════════════════════════════════════
  @Get('settings')
  listSettings() {
    return this.admin.listSettings();
  }

  @Patch('settings/:key')
  @Audited({ action: 'setting.admin.update', targetType: 'setting' })
  upsertSetting(
    @Param('key') key: string,
    @Body() body: { value: any; description?: string; category?: string },
    @Req() req: any,
  ) {
    return this.admin.upsertSetting(key, body.value, {
      description: body.description,
      category: body.category,
      actorId: req.user.userId,
    });
  }

  @Delete('settings/:key')
  @Audited({ action: 'setting.admin.delete', targetType: 'setting' })
  deleteSetting(@Param('key') key: string) {
    return this.admin.deleteSetting(key);
  }

  // ═══════════════════════════════════════════
  // Feature Flags
  // ═══════════════════════════════════════════
  @Get('flags')
  listFlags() {
    return this.admin.listFlags();
  }

  @Patch('flags/:key')
  @Audited({ action: 'flag.admin.update', targetType: 'flag' })
  upsertFlag(
    @Param('key') key: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.admin.upsertFlag(key, { ...body, actorId: req.user.userId });
  }

  @Delete('flags/:key')
  @Audited({ action: 'flag.admin.delete', targetType: 'flag' })
  deleteFlag(@Param('key') key: string) {
    return this.admin.deleteFlag(key);
  }

  // ═══════════════════════════════════════════
  // Backup
  // ═══════════════════════════════════════════
  @Get('backup')
  @Audited({ action: 'backup.admin.download', targetType: 'backup' })
  async backup(@Res() res: any) {
    const data = await this.admin.createBackup();
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ratayar-backup-${ts}.json"`,
    );
    res.end(JSON.stringify(data, null, 2));
  }

}
