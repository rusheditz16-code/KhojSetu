import { Module } from '@nestjs/common';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';
import { AuthModule } from '../auth/auth.module';
import { StorageService } from '../storage/storage.service';
import { MatchingService } from '../matches/matching.service';
import { QueueService } from '../queues/queue.service';
import { TelemetryService } from '../telemetry/telemetry.service';

@Module({
  imports: [AuthModule],
  controllers: [ItemsController],
  providers: [
    ItemsService,
    StorageService,
    MatchingService,
    QueueService,
    TelemetryService,
  ],
  exports: [ItemsService],
})
export class ItemsModule {}
