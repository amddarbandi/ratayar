import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IpBlockGuard implements CanActivate {
  private readonly logger = new Logger(IpBlockGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress;

    if (!ip) return true;

    try {
      const block = await this.prisma.blockedIp.findFirst({
        where: { ip },
      });
      if (!block) return true;
      if (block.until && block.until.getTime() < Date.now()) {
        // expired — clean up
        await this.prisma.blockedIp.delete({ where: { ip } }).catch(() => {});
        return true;
      }
      this.logger.warn(`blocked ip attempt: ${ip}`);
      throw new ForbiddenException('دسترسی از این آدرس مسدود است');
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      // DB error → fail open (do not block traffic on DB failure)
      return true;
    }
  }
}
