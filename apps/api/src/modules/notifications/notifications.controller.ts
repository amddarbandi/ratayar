import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Req, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  findAll(
    @Req() req: any,
    @Query('unreadOnly') unreadOnly?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notifications.findAll(req.user.userId, {
      unreadOnly: unreadOnly === 'true',
      limit: limit ? parseInt(limit) : 50,
    });
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.notifications.getUnreadCount(req.user.userId);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notifications.markAsRead(req.user.userId, id);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  markAllAsRead(@Req() req: any) {
    return this.notifications.markAllAsRead(req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Req() req: any, @Param('id') id: string) {
    return this.notifications.remove(req.user.userId, id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateNotificationDto) {
    return this.notifications.create(req.user.userId, dto);
  }
}
