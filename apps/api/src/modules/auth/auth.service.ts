import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        fullName: dto.fullName,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
      },
      select: {
        id: true,
        phone: true,
        fullName: true,
        birthDate: true,
        role: true,
        createdAt: true,
      },
    });

    this.logger.log(`✅ User registered: ${user.phone}`);

    const tokens = await this.generateTokens(user.id, user.phone);

    return {
      user,
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // 🔒 بررسی قفل حساب
    const lockKey = `lockout:${dto.phone}`;
    const lockCount = await this.redis.get(lockKey);
    if (lockCount && parseInt(lockCount) >= 5) {
      throw new UnauthorizedException(
        'حساب شما موقتاً قفل شده. لطفاً ۱۵ دقیقه دیگر تلاش کنید',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user || user.deletedAt) {
      await this.recordFailedLogin(dto.phone);
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('حساب کاربری غیرفعال است');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      await this.recordFailedLogin(dto.phone);
      throw new UnauthorizedException('شماره موبایل یا رمز عبور اشتباه است');
    }

    // ✅ ورود موفق - پاک کردن failed attempts
    await this.redis.del(lockKey);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    this.logger.log(`✅ User logged in: ${user.phone}`);

    const tokens = await this.generateTokens(user.id, user.phone);

    return {
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        birthDate: user.birthDate,
        role: user.role,
        twoFaEnabled: user.twoFaEnabled,
      },
      ...tokens,
    };
  }

  async sendOtp(phone: string) {
    const rateLimitKey = `otp:ratelimit:${phone}`;
    const attempts = await this.redis.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= 5) {
      throw new BadRequestException('تعداد درخواست‌ها بیش از حد مجاز. لطفاً بعداً تلاش کنید');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${phone}`;
    await this.redis.set(otpKey, code, 300);

    await this.redis.incr(rateLimitKey);
    await this.redis.expire(rateLimitKey, 3600);

    const devMode = this.config.get('DEV_OTP_ENABLED') === 'true';
    this.logger.log(`📱 DEV_OTP_ENABLED = ${devMode}, code = ${code}`);

    return {
      success: true,
      message: 'کد تایید ارسال شد',
      code: devMode ? code : undefined,
    };
  }

  async verifyOtp(phone: string, code: string) {
    const otpKey = `otp:${phone}`;
    const storedCode = await this.redis.get(otpKey);

    if (!storedCode) {
      throw new BadRequestException('کد تایید منقضی شده است');
    }

    if (storedCode !== code) {
      throw new BadRequestException('کد تایید اشتباه است');
    }

    await this.redis.del(otpKey);

    return {
      success: true,
      message: 'کد تایید شد',
      verified: true,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_SECRET'),
      });

      const blacklistKey = `blacklist:${payload.jti}`;
      const isBlacklisted = await this.redis.exists(blacklistKey);
      if (isBlacklisted) {
        throw new UnauthorizedException('توکن منقضی شده است');
      }

      const tokens = await this.generateTokens(payload.sub, payload.phone);
      await this.redis.set(blacklistKey, 'true', 30 * 24 * 60 * 60);

      return tokens;
    } catch {
      throw new UnauthorizedException('توکن نامعتبر است');
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phone: true,
        fullName: true,
        birthDate: true,
        role: true,
        status: true,
        twoFaEnabled: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    return user;
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      try {
        const payload = this.jwt.verify(refreshToken, {
          secret: this.config.get('JWT_SECRET'),
        });
        const blacklistKey = `blacklist:${payload.jti}`;
        await this.redis.set(blacklistKey, 'true', 30 * 24 * 60 * 60);
      } catch {}
    }

    return { success: true, message: 'خروج موفق' };
  }

  private async generateTokens(userId: string, phone: string) {
    const jti = `${userId}-${Date.now()}`;
    const payload = { sub: userId, phone, jti };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    return { accessToken, refreshToken };
  }

  // ============================================
  // Helper: Record Failed Login
  // ============================================
  private async recordFailedLogin(phone: string) {
    const lockKey = `lockout:${phone}`;
    const count = await this.redis.incr(lockKey);
    if (count === 1) {
      await this.redis.expire(lockKey, 900);
    }
    this.logger.warn(`Failed login attempt ${count} for ${phone}`);
  }
}
