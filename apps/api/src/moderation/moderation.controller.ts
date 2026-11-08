import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { AuthGuard, ModeratorGuard } from '../auth/auth.guard';

@Controller('api/moderation')
@UseGuards(AuthGuard, ModeratorGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('stats')
  async getStats() {
    return this.moderationService.getStats();
  }

  @Get('flagged')
  async getFlagged() {
    return this.moderationService.getFlaggedItems();
  }

  @Post('flagged/:id/resolve')
  async resolveFlag(
    @Param('id') id: string,
    @Body('action') action: string,
    @Body('resolutionNotes') notes: string,
    @Req() req: any,
  ) {
    return this.moderationService.resolveFlag(id, action, notes, req.user);
  }

  @Post('items/:id/mark-returned')
  async markReturned(
    @Param('id') id: string,
    @Body('handedToName') handedToName: string,
    @Body('notes') notes: string,
    @Req() req: any,
  ) {
    return this.moderationService.markReturned(id, handedToName, notes, req.user);
  }

  @Get('audit-logs')
  async getAuditLogs() {
    return this.moderationService.getAuditLogs();
  }
}
