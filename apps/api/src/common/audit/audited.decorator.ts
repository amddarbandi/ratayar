import { SetMetadata } from '@nestjs/common';

export const AUDITED_KEY = 'audited';

export interface AuditedOptions {
  action: string;            // 'user.ban' | 'payment.approve' | ...
  targetType?: string;       // 'user' | 'payment' | ...
  targetIdFrom?: string;     // 'params.id' | 'body.userId' | 'params.id'
}

export const Audited = (opts: AuditedOptions) =>
  SetMetadata(AUDITED_KEY, opts);
