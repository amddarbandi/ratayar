import { Global, Module } from '@nestjs/common';
import { PlatformSettingsService } from './settings.service';

@Global()
@Module({
  providers: [PlatformSettingsService],
  exports: [PlatformSettingsService],
})
export class PlatformSettingsModule {}
