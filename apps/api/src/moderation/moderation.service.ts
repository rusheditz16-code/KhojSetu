import { Injectable, NotFoundException } from '@nestjs/common';
import { DbService } from '../prisma/db.service';
import { User } from '@prisma/client';

@Injectable()
export class ModerationService {
  constructor(private readonly db: DbService) {}

  async getStats() {
    return this.db.getModerationStats();
  }

  async getFlaggedItems() {
    const all = await this.db.getItems();
    const flagged = all.filter((i) => i.isFlagged);
    return { flaggedItems: flagged };
  }

  async resolveFlag(id: string, action: string, notes: string, user: User) {
    const item = await this.db.getItemById(id);
    if (!item) throw new NotFoundException('Item not found');

    if (action === 'unflag') {
      await this.db.updateItem(id, { isFlagged: false, flagReason: null });
    } else if (action === 'remove') {
      await this.db.deleteItem(id);
    } else if (action === 'close') {
      await this.db.updateItem(id, { status: 'CLOSED', isFlagged: false });
    }

    await this.db.logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: `FLAG_${action.toUpperCase()}`,
      targetType: 'item',
      targetId: id,
      details: { title: item.title, notes },
    });

    return { message: `Flag resolved with action: ${action}` };
  }

  async markReturned(id: string, handoverName: string, notes: string, user: User) {
    const item = await this.db.getItemById(id);
    if (!item) throw new NotFoundException('Item not found');

    await this.db.updateItem(id, { status: 'RETURNED' });

    await this.db.logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'PROCTOR_RETURNED_ITEM',
      targetType: 'item',
      targetId: id,
      details: { title: item.title, handoverName, notes },
    });

    await this.db.createNotification({
      userId: item.userId,
      type: 'ITEM_RETURNED',
      title: '🎉 Item Marked Returned by Proctor',
      message: `Your report "${item.title}" was officially marked returned by ${user.name}. Notes: ${notes || 'Handover verified.'}`,
      linkUrl: `/items/${item.id}`,
    });

    return { message: 'Item marked as returned and audit record saved.' };
  }

  async getAuditLogs(limit = 100) {
    const auditLogs = await this.db.getAuditLogs(limit);
    return { auditLogs };
  }
}
