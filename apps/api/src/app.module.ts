import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ItemsModule } from './items/items.module';
import { MatchesModule } from './matches/matches.module';
import { ClaimsModule } from './claims/claims.module';
import { ModerationModule } from './moderation/moderation.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ItemsModule,
    MatchesModule,
    ClaimsModule,
    ModerationModule,
    NotificationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
