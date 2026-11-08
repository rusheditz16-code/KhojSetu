import { Module } from '@nestjs/common';
import { MatchesController } from './matches.controller';
import { MatchingService } from './matching.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [MatchesController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchesModule {}
