import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserActivityInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: any = context.switchToHttp().getRequest();
    const userId = req.user?.userId;

    return next.handle().pipe(
      tap(() => {
        if (!userId) return;
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        this.prisma.userActivity
          .upsert({
            where: { userId_day: { userId, day } },
            create: { userId, day, count: 1 },
            update: { count: { increment: 1 } },
          })
          .catch(() => {});
      }),
    );
  }
}
