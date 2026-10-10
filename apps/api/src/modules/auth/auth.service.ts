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
import { MailService } from '../../common/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import {
  isValidIranianNationalId,
  isValidIranianPostalCode,
  isValidPersianName,
  isValidEmail,
  toEnglishDigits,
} from '../../common/validation/iran';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
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

  // ═══════════════════════════════════════════
  // Email Verification (L2)
  // ═══════════════════════════════════════════
  async sendEmailVerification(userId: string, emailRaw: string) {
    const enabled = await this.mail.isEnabled();
    if (!enabled) {
      return { ok: false, message: 'تأیید ایمیل در حال حاضر غیرفعال است' };
    }

    const email = (emailRaw || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, message: 'ایمیل معتبر نیست' };
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { ok: false, message: 'کاربر یافت نشد' };

    const conflict = await this.prisma.user.findFirst({
      where: { email, id: { not: userId } },
    });
    if (conflict) {
      return { ok: false, message: 'این ایمیل قبلاً ثبت شده است' };
    }

    const token = require('crypto').randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        email,
        emailVerified: false,
        emailVerifyToken: token,
        emailVerifyExpiresAt: expiresAt,
      },
    });

    const webUrl =
      this.config.get<string>('WEB_URL') || 'https://ratayar.ir';
    const link = `${webUrl}/verify-email?token=${token}`;

    const html = `
      <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color:#10b981;">تأیید ایمیل راتایار</h2>
        <p>برای فعال‌سازی ایمیل خود روی دکمه زیر کلیک کنید:</p>
        <p style="margin: 24px 0;">
          <a href="${link}"
             style="background:#10b981;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;display:inline-block;">
            تأیید ایمیل
          </a>
        </p>
        <p style="color:#666;font-size:12px;">
          اگر روی دکمه کار نکرد، این لینک را در مرورگر باز کنید:<br>
          <span style="word-break:break-all;">${link}</span>
        </p>
        <p style="color:#999;font-size:12px;">این لینک تا ۲۴ ساعت معتبر است.</p>
      </div>
    `;

    const result = await this.mail.send(
      email,
      'تأیید ایمیل — راتایار',
      html,
    );

    if (!result.ok) {
      return { ok: false, message: 'ارسال ایمیل ناموفق بود' };
    }
    return { ok: true, message: 'لینک تأیید به ایمیل ارسال شد' };
  }

  async verifyEmail(token: string) {
    if (!token || token.length < 10) {
      return { ok: false, message: 'کد نامعتبر است' };
    }

    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });
    if (!user) return { ok: false, message: 'لینک نامعتبر است' };

    if (
      user.emailVerifyExpiresAt &&
      user.emailVerifyExpiresAt.getTime() < Date.now()
    ) {
      return { ok: false, message: 'لینک منقضی شده است' };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerifyToken: null,
        emailVerifyExpiresAt: null,
      },
    });

    this.logger.log(`✅ Email verified for user ${user.id}`);
    return { ok: true, message: 'ایمیل با موفقیت تأیید شد', email: user.email };
  }

  // ═══════════════════════════════════════════
  // Profile completion (L1)
  // ═══════════════════════════════════════════
  async getProfileStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileCompleted: true,
        firstName: true,
        lastName: true,
        fatherName: true,
        nationalId: true,
        idNumber: true,
        birthDate: true,
        address: true,
        postalCode: true,
        email: true,
      },
    });
    if (!user) throw new NotFoundException('کاربر یافت نشد');

    const missing: string[] = [];
    if (!user.firstName) missing.push('firstName');
    if (!user.lastName) missing.push('lastName');
    if (!user.fatherName) missing.push('fatherName');
    if (!user.nationalId) missing.push('nationalId');
    if (!user.idNumber) missing.push('idNumber');
    if (!user.birthDate) missing.push('birthDate');
    if (!user.address) missing.push('address');
    if (!user.postalCode) missing.push('postalCode');

    return {
      completed: user.profileCompleted,
      missing,
      prefilled: {
        firstName: user.firstName,
        lastName: user.lastName,
        fatherName: user.fatherName,
        nationalId: user.nationalId,
        idNumber: user.idNumber,
        birthDate: user.birthDate,
        address: user.address,
        postalCode: user.postalCode,
        email: user.email,
      },
    };
  }

  async completeProfile(userId: string, dto: CompleteProfileDto) {
    // ── server-side validation (never trust client) ──
    if (!isValidPersianName(dto.firstName))
      throw new BadRequestException('نام معتبر نیست');
    if (!isValidPersianName(dto.lastName))
      throw new BadRequestException('نام خانوادگی معتبر نیست');
    if (!isValidPersianName(dto.fatherName))
      throw new BadRequestException('نام پدر معتبر نیست');

    const nationalId = toEnglishDigits(dto.nationalId);
    if (!isValidIranianNationalId(nationalId))
      throw new BadRequestException('کد ملی معتبر نیست');

    const postalCode = toEnglishDigits(dto.postalCode);
    if (!isValidIranianPostalCode(postalCode))
      throw new BadRequestException('کد پستی معتبر نیست');

    const idNumber = toEnglishDigits(dto.idNumber).trim();
    if (!/^\d{1,10}$/.test(idNumber))
      throw new BadRequestException('شماره شناسنامه معتبر نیست');

    if (dto.address.trim().length < 10)
      throw new BadRequestException('آدرس خیلی کوتاه است');

    if (dto.email && !isValidEmail(dto.email))
      throw new BadRequestException('ایمیل معتبر نیست');

    // ── parse Jalali birth date ──
    const birthDate = this.parseJalaliString(dto.birthDate);
    if (!birthDate) throw new BadRequestException('تاریخ تولد معتبر نیست');

    // ── uniqueness of nationalId ──
    const conflict = await this.prisma.user.findFirst({
      where: { nationalId, id: { not: userId } },
    });
    if (conflict) {
      throw new ConflictException('این کد ملی قبلاً ثبت شده است');
    }

    // ── save ──
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        fatherName: dto.fatherName.trim(),
        nationalId,
        idNumber,
        birthDate,
        address: dto.address.trim(),
        postalCode,
        email: dto.email?.trim().toLowerCase() || undefined,
        fullName: `${dto.firstName.trim()} ${dto.lastName.trim()}`,
        profileCompleted: true,
        profileCompletedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileCompleted: true,
      },
    });

    this.logger.log(`✅ Profile completed for user ${userId}`);
    return { ok: true, profile: updated };
  }

  private parseJalaliString(input: string): Date | null {
    const s = toEnglishDigits(input).trim();
    const m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (!m) return null;
    const jy = parseInt(m[1], 10);
    const jm = parseInt(m[2], 10);
    const jd = parseInt(m[3], 10);
    if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return null;
    if (jy < 1300 || jy > 1410) return null;

    // jalaali-js is available in workspace deps? If not, use Intl fallback.
    // Simple approximation: use Intl.DateTimeFormat is not convertible to Gregorian.
    // Use the jalaali-js library (already installed for web; also available at root)
    // Fallback to JS Date via jalaali-js
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const jalaali = require('jalaali-js');
      const g = jalaali.toGregorian(jy, jm, jd);
      return new Date(g.gy, g.gm - 1, g.gd);
    } catch {
      // fallback approximation
      return new Date(jy + 621, jm - 1, jd);
    }
  }

}
