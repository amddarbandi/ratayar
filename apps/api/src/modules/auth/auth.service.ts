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
import * as speakeasy from 'speakeasy';
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
    // ۱. چک تکراری نبودن شماره موبایل
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException('این شماره موبایل قبلاً ثبت شده است');
    }

    // 🔒 SEC-002: verify OTP قبل از ساخت کاربر
    // اگر کد اشتباه/منقضی باشد، BadRequestException می‌دهد
    // اگر درست باشد، کد را از Redis پاک می‌کند (یکبار مصرف)
    if (!dto.otpCode) {
      throw new BadRequestException('کد تایید الزامی است');
    }
    await this.verifyOtp(dto.phone, dto.otpCode);

    // ۲. hash password
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

    // 🔒 SEC-003: چک 2FA
    if (user.twoFaEnabled) {
      // مرحله ۱: اگر کد 2FA ارسال نشده، درخواست کد کن
      if (!dto.twoFaCode) {
        return {
          requires2FA: true,
          phone: user.phone,
          message: 'کد ورود دو مرحله‌ای را وارد کنید',
        };
      }

      // مرحله ۲: secret باید موجود باشد
      if (!user.twoFaSecret) {
        this.logger.error(
          `2FA enabled but secret missing for user ${user.phone}`,
        );
        throw new UnauthorizedException(
          'خطای پیکربندی 2FA. لطفاً با پشتیبانی تماس بگیرید',
        );
      }

      // مرحله ۳: verify TOTP با پنجره ±30 ثانیه
      const isValid2FA = speakeasy.totp.verify({
        secret: user.twoFaSecret,
        encoding: 'base32',
        token: dto.twoFaCode,
        window: 1,
      });

      if (!isValid2FA) {
        await this.recordFailedLogin(dto.phone);
        throw new UnauthorizedException('کد ورود دو مرحله‌ای اشتباه است');
      }
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

    // 🔒 فقط در environment development و اگر DEV_OTP_ENABLED=true باشد، کد برمی‌گردد
    // در production، حتی اگر DEV_OTP_ENABLED=true باشد، کد نمایش داده نمی‌شود.
    const nodeEnv = this.config.get<string>('NODE_ENV', 'development');
    const devOtpEnabled = this.config.get('DEV_OTP_ENABLED') === 'true';
    const showCode = nodeEnv === 'development' && devOtpEnabled;

    if (showCode) {
      this.logger.warn(`📱 [DEV ONLY] OTP for ${phone}: ${code}`);
    } else {
      this.logger.log(`📱 OTP sent for ${phone.slice(0, 4)}***${phone.slice(-3)}`);
    }

    return {
      success: true,
      message: 'کد تایید ارسال شد',
      ...(showCode && { code }),
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

      // 🔒 بررسی blacklist
      const blacklistKey = `blacklist:${payload.jti}`;
      const isBlacklisted = await this.redis.exists(blacklistKey);
      if (isBlacklisted) {
        throw new UnauthorizedException('توکن منقضی شده است');
      }

      // 🔒 SEC-005: invalidate refresh توکن‌های صادرشده قبل از تغییر رمز
      const pwdChangedAtRaw = await this.redis.get(`pwd-changed:${payload.sub}`);
      if (pwdChangedAtRaw) {
        const pwdChangedAtMs = parseInt(pwdChangedAtRaw, 10);
        const tokenIssuedAtMs = (payload.iat || 0) * 1000;

        if (pwdChangedAtMs > tokenIssuedAtMs) {
          throw new UnauthorizedException(
            'رمز عبور تغییر کرده است. لطفاً دوباره وارد شوید',
          );
        }
      }

      const tokens = await this.generateTokens(payload.sub, payload.phone);
      await this.redis.set(blacklistKey, 'true', 30 * 24 * 60 * 60);

      return tokens;
    } catch (err) {
      // اگر خطای مورد انتظار ما بود، دوباره پرتاب کن (پیام دقیق)
      if (err instanceof UnauthorizedException) {
        throw err;
      }
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
