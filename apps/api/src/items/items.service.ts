import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { DbService } from '../prisma/db.service';
import { StorageService } from '../storage/storage.service';
import { MatchingService } from '../matches/matching.service';
import { QueueService, JobType } from '../queues/queue.service';
import { TelemetryService } from '../telemetry/telemetry.service';
import { Item, User } from '@prisma/client';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    private readonly db: DbService,
    private readonly storage: StorageService,
    private readonly matching: MatchingService,
    private readonly queue: QueueService,
    private readonly telemetry: TelemetryService,
  ) {}

  async findAll(filters: any) {
    return this.telemetry.traceAsync('items.findAll', async (span) => {
      span.setAttribute('filters', JSON.stringify(filters));
      const items = await this.db.getItems(filters);
      return { items, count: items.length };
    });
  }

  async findOne(id: string) {
    const item = await this.db.getItemById(id);
    if (!item) throw new NotFoundException('Item not found');
    return { item };
  }

  async create(data: any, user: User, photoFile?: Express.Multer.File) {
    return this.telemetry.traceAsync('items.create', async (span) => {
      let photoUrl = data.photo_url || null;
      let photoKey = null;

      // OWASP Photo Upload to S3 / Storage
      if (photoFile) {
        const uploadRes = await this.storage.uploadSecureFile(photoFile);
        photoUrl = uploadRes.url;
        photoKey = uploadRes.key;

        // Enqueue BullMQ background job for async image processing & vector embedding
        await this.queue.addJob(JobType.IMAGE_PROCESS, {
          photoKey,
          size: photoFile.size,
          mimetype: photoFile.mimetype,
        });
      }

      const item = await this.db.createItem({
        type: data.type,
        title: data.title,
        category: data.category,
        description: data.description,
        campusArea: data.location_campus_area || data.campusArea,
        zone: data.location_zone || data.zone,
        latitude: data.latitude ? parseFloat(data.latitude) : 12.9716,
        longitude: data.longitude ? parseFloat(data.longitude) : 77.5946,
        incidentDate: data.incident_date ? new Date(data.incident_date) : new Date(),
        photoUrl,
        photoKey,
        secretPrompt: data.secret_verification_prompt || data.secretPrompt || null,
        userId: user.id,
      });

      span.setAttribute('item.id', item.id);
      span.setAttribute('item.type', item.type);

      // Async BullMQ match scanner
      try {
        const oppositeItems = await this.db.getItems({
          type: item.type === 'LOST' ? 'FOUND' : 'LOST',
          status: 'OPEN',
        });

        const highMatches = this.matching.rankMatches(item, oppositeItems, 70);
        for (const match of highMatches) {
          // Send notification to existing candidate poster
          await this.queue.addJob(JobType.NOTIFICATION_DISPATCH, {
            userId: match.item.userId,
            title: `🎯 High Match (${match.score}%): ${item.title}`,
            message: `A new ${item.type} report closely matches yours: ${match.explanationSummary}`,
            linkUrl: `/items/${item.id}`,
          });

          await this.db.createNotification({
            userId: match.item.userId,
            type: 'MATCH_FOUND',
            title: `🎯 High Match (${match.score}%): ${item.title}`,
            message: `A new ${item.type} report closely matches yours: ${match.explanationSummary}`,
            linkUrl: `/items/${item.id}`,
          });
        }
      } catch (scanErr) {
        this.logger.warn(`Background match scan note: ${scanErr.message}`);
      }

      return { message: 'Item posted successfully!', item };
    });
  }

  async updateStatus(id: string, status: string, user: User, notes?: string) {
    const item = await this.db.getItemById(id);
    if (!item) throw new NotFoundException('Item not found');

    const isOwner = item.userId === user.id;
    const isMod = user.role === 'MODERATOR' || user.role === 'ADMIN';

    if (!isOwner && !isMod) {
      throw new ForbiddenException('You can only update status for your own reports.');
    }

    const updated = await this.db.updateItem(id, { status: status.toUpperCase() });

    if (isMod || status.toUpperCase() === 'RETURNED') {
      await this.db.logAuditEvent({
        actorId: user.id,
        actorRole: user.role,
        action: `ITEM_STATUS_${status.toUpperCase()}`,
        targetType: 'item',
        targetId: id,
        details: { previousStatus: item.status, newStatus: status, notes },
      });
    }

    return { message: `Item marked as ${status}`, item: updated };
  }

  async flagItem(id: string, reason: string, user: User) {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException('Please provide a reason with at least 5 characters.');
    }

    const item = await this.db.getItemById(id);
    if (!item) throw new NotFoundException('Item not found');

    await this.db.updateItem(id, { isFlagged: true, flagReason: reason.trim() });

    await this.db.logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'ITEM_FLAGGED',
      targetType: 'item',
      targetId: id,
      details: { reason: reason.trim(), title: item.title },
    });

    return { message: 'Post flagged for campus proctor review.' };
  }

  async delete(id: string, user: User) {
    const item = await this.db.getItemById(id);
    if (!item) throw new NotFoundException('Item not found');

    const isOwner = item.userId === user.id;
    const isMod = user.role === 'MODERATOR' || user.role === 'ADMIN';

    if (!isOwner && !isMod) {
      throw new ForbiddenException('Unauthorized: Only creator or proctor can delete this item.');
    }

    await this.db.deleteItem(id);
    await this.db.logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: 'ITEM_DELETED',
      targetType: 'item',
      targetId: id,
      details: { title: item.title },
    });

    return { message: 'Item deleted successfully.' };
  }
}
