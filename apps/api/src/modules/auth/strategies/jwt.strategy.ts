import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // ۱. بررسی موجود بودن کاربر
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, phone: true, status: true, deletedAt: true },
    });

    if (!user || user.deletedAt || user.status !== 'active') {
      throw new UnauthorizedException('کاربر معتبر نیست');
    }

    // 🔒 SEC-005: invalidate توکن‌های صادرشده قبل از تغییر رمز
    // اگر کاربری رمزش را تغییر داده، کلید pwd-changed:{userId} با
    // timestamp آن تغییر در Redis ذخیره می‌شود (milliseconds).
    // اگر توکن فعلی قبل از آن زمان صادر شده → 401
    const pwdChangedAtRaw = await this.redis.get(`pwd-changed:${user.id}`);
    if (pwdChangedAtRaw) {
      const pwdChangedAtMs = parseInt(pwdChangedAtRaw, 10);
      const tokenIssuedAtMs = (payload.iat || 0) * 1000;

      // اگر تغییر رمز بعد از صدور توکن بوده → توکن باطل است
      if (pwdChangedAtMs > tokenIssuedAtMs) {
        throw new UnauthorizedException(
          'رمز عبور تغییر کرده است. لطفاً دوباره وارد شوید',
        );
      }
    }

    return {
      userId: user.id,
      phone: user.phone,
    };
  }
}
