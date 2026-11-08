import { Controller, Get, Patch, Post, Param, Req, UseGuards } from '@nestjs/common';
import { DbService } from '../prisma/db.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly db: DbService) {}

  @Get()
  async getNotifications(@Req() req: any) {
    const notifications = await this.db.getNotifications(req.user.id);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { notifications, unreadCount };
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    await this.db.markNotificationRead(id);
    return { message: 'Marked read' };
  }

  @Post('mark-all-read')
  async markAllRead(@Req() req: any) {
    await this.db.markAllNotificationsRead(req.user.id);
    return { message: 'All marked read' };
  }
}
