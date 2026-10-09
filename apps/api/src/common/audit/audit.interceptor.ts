import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AUDITED_KEY, AuditedOptions } from './audited.decorator';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly audit: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const opts = this.reflector.getAllAndOverride<AuditedOptions>(
      AUDITED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!opts) return next.handle();

    const req: any = context.switchToHttp().getRequest();
    const user = req.user || {};
    const ip =
      req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
      req.ip ||
      req.socket?.remoteAddress ||
      null;
    const ua = req.headers['user-agent'] || null;

    // Resolve targetId by convention: "params.id" | "body.xxx" | "params.xxx"
    let targetId: string | null = null;
    if (opts.targetIdFrom) {
      const [root, key] = opts.targetIdFrom.split('.');
      const value = (req as any)[root]?.[key];
      if (value != null) targetId = String(value);
    } else if (req.params?.id) {
      targetId = String(req.params.id);
    }

    // Capture body snapshot (mask sensitive fields)
    const body: any = req.body ? { ...req.body } : {};
    for (const k of Object.keys(body)) {
      if (/password|token|secret|otp|code/i.test(k)) body[k] = '[redacted]';
    }

    return next.handle().pipe(
      tap({
        next: () => {
          this.audit.write({
            actorId: user.userId ?? null,
            actorPhone: user.phone ?? null,
            actorRole: user.role ?? null,
            action: opts.action,
            targetType: opts.targetType ?? null,
            targetId,
            meta: { body, params: req.params, query: req.query },
            ip,
            userAgent: ua,
          });
        },
        error: (err) => {
          this.audit.write({
            actorId: user.userId ?? null,
            actorPhone: user.phone ?? null,
            actorRole: user.role ?? null,
            action: `${opts.action}.failed`,
            targetType: opts.targetType ?? null,
            targetId,
            meta: {
              body,
              params: req.params,
              query: req.query,
              error: err?.message,
            },
            ip,
            userAgent: ua,
          });
        },
      }),
    );
  }
}
