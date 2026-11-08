import { Module } from '@nestjs/common';
import { ClaimsController } from './claims.controller';
import { ClaimsService } from './claims.service';
import { AuthModule } from '../auth/auth.module';
import { StorageService } from '../storage/storage.service';
import { QueueService } from '../queues/queue.service';
import { TelemetryService } from '../telemetry/telemetry.service';

@Module({
  imports: [AuthModule],
  controllers: [ClaimsController],
  providers: [ClaimsService, StorageService, QueueService, TelemetryService],
  exports: [ClaimsService],
})
export class ClaimsModule {}
