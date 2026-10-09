import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuditService } from '../../common/audit/audit.service';
import { MinioModule } from '../../common/minio/minio.module';

@Module({
  imports: [MinioModule],
  controllers: [AdminController],
  providers: [AdminService, AuditService],
  exports: [AdminService],
})
export class AdminModule {}
