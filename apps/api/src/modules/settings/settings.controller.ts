import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Verify2FADto } from './dto/toggle-2fa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  // Profile
  @Patch('profile')
  updateProfile(@Req() req: any, @Body() dto: UpdateProfileDto) {
    return this.settings.updateProfile(req.user.userId, dto);
  }

  // Password
  @Post('password')
  @HttpCode(HttpStatus.OK)
  changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    return this.settings.changePassword(req.user.userId, dto);
  }

  // 2FA
  @Post('2fa/setup')
  setup2FA(@Req() req: any) {
    return this.settings.setup2FA(req.user.userId);
  }

  @Post('2fa/verify')
  @HttpCode(HttpStatus.OK)
  verify2FA(@Req() req: any, @Body() dto: Verify2FADto) {
    return this.settings.verify2FA(req.user.userId, dto.code);
  }

  @Post('2fa/disable')
  @HttpCode(HttpStatus.OK)
  disable2FA(@Req() req: any, @Body() dto: Verify2FADto) {
    return this.settings.disable2FA(req.user.userId, dto.code);
  }

  @Get('2fa/backup-codes')
  getBackupCodes(@Req() req: any) {
    return this.settings.getBackupCodes(req.user.userId);
  }

  @Post('2fa/backup-codes/regenerate')
  regenerateBackupCodes(@Req() req: any) {
    return this.settings.regenerateBackupCodes(req.user.userId);
  }

  // Sessions
  @Get('sessions')
  getSessions(@Req() req: any) {
    return this.settings.getSessions(req.user.userId);
  }

  // Delete Account
  @Delete('account')
  @HttpCode(HttpStatus.OK)
  deleteAccount(@Req() req: any, @Body() body: { password: string }) {
    return this.settings.deleteAccount(req.user.userId, body.password);
  }
}
