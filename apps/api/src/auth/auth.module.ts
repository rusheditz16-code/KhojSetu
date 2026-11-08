import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard, ModeratorGuard } from './auth.guard';
import { DbService } from '../prisma/db.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, ModeratorGuard, DbService, PrismaService],
  exports: [AuthGuard, ModeratorGuard, DbService, PrismaService],
})
export class AuthModule {}
