import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [AdminController],
  providers: [AdminService, AuditService],
  exports: [AdminService],
})
export class AdminModule {}
