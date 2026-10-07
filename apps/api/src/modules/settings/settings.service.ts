import {
  Injectable, Logger, BadRequestException, UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ============================================
  // Update Profile
  // ============================================
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: any = {};
    if (dto.fullName) data.fullName = dto.fullName;
    if (dto.birthDate) data.birthDate = new Date(dto.birthDate);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        phone: true,
        fullName: true,
        birthDate: true,
        role: true,
      },
    });

    return user;
  }

  // ============================================
  // Change Password
  // ============================================
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('کاربر یافت نشد');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('رمز عبور فعلی اشتباه است');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Blacklist all refresh tokens
    await this.redis.set(`pwd-changed:${userId}`, Date.now().toString(), 86400 * 30);

    this.logger.log(`✅ Password changed for user ${userId}`);
    return { success: true, message: 'رمز عبور تغییر کرد' };
  }

  // ============================================
  // Setup 2FA
  // ============================================
  async setup2FA(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('کاربر یافت نشد');

    if (user.twoFaEnabled) {
      throw new BadRequestException('2FA قبلاً فعال است');
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Ratayar (${user.phone})`,
      issuer: 'Ratayar',
      length: 32,
    });

    // Store temporarily in Redis (10 min)
    await this.redis.set(
      `2fa-setup:${userId}`,
      secret.base32,
      600,
    );

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntry: secret.base32,
    };
  }

  // ============================================
  // Verify and Enable 2FA
  // ============================================
  async verify2FA(userId: string, code: string) {
    const secret = await this.redis.get(`2fa-setup:${userId}`);
    if (!secret) {
      throw new BadRequestException('ابتدا 2FA را راه‌اندازی کن');
    }

    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('کد اشتباه است');
    }

    // Enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFaEnabled: true,
        twoFaSecret: secret,
      },
    });

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    // SEC-004: کدهای پشتیبان با TTL یک‌ساله (۳۱۵۳۶۰۰۰ ثانیه)
    // پیش‌تر TTL=0 بود که یعنی هرگز expire نمی‌شدند.
    await this.redis.set(
      `2fa-backup:${userId}`,
      JSON.stringify(backupCodes),
      365 * 24 * 60 * 60, // 1 year
    );

    await this.redis.del(`2fa-setup:${userId}`);

    this.logger.log(`✅ 2FA enabled for ${userId}`);

    return {
      success: true,
      backupCodes,
      message: '2FA فعال شد',
    };
  }

  // ============================================
  // Disable 2FA
  // ============================================
  async disable2FA(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFaEnabled || !user.twoFaSecret) {
      throw new BadRequestException('2FA فعال نیست');
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!isValid) {
      throw new BadRequestException('کد اشتباه است');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFaEnabled: false,
        twoFaSecret: null,
      },
    });

    await this.redis.del(`2fa-backup:${userId}`);

    return { success: true, message: '2FA غیرفعال شد' };
  }

  // ============================================
  // Get Backup Codes
  // ============================================
  async getBackupCodes(userId: string) {
    const codesJson = await this.redis.get(`2fa-backup:${userId}`);
    if (!codesJson) return { codes: [] };
    return { codes: JSON.parse(codesJson) };
  }

  // ============================================
  // Regenerate Backup Codes
  // ============================================
  async regenerateBackupCodes(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFaEnabled) {
      throw new BadRequestException('2FA فعال نیست');
    }

    const backupCodes = Array.from({ length: 8 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    // SEC-004: کدهای پشتیبان با TTL یک‌ساله (۳۱۵۳۶۰۰۰ ثانیه)
    await this.redis.set(
      `2fa-backup:${userId}`,
      JSON.stringify(backupCodes),
      365 * 24 * 60 * 60, // 1 year
    );

    return { codes: backupCodes };
  }

  // ============================================
  // Get Sessions
  // ============================================
  async getSessions(userId: string) {
    // فعلاً ساده — در فاز بعد می‌توان tracking کامل کرد
    return {
      sessions: [
        {
          id: 'current',
          device: 'مرورگر فعلی',
          lastActive: new Date().toISOString(),
          current: true,
        },
      ],
    };
  }

  // ============================================
  // Delete Account
  // ============================================
  async deleteAccount(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('کاربر یافت نشد');

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new BadRequestException('رمز عبور اشتباه است');
    }

    // Soft delete
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        status: 'deleted',
      },
    });

    this.logger.log(`🗑️ Account deleted: ${userId}`);
    return { success: true, message: 'حساب حذف شد' };
  }
}
