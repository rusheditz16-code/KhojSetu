import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { DbService } from '../prisma/db.service';
import { StorageService } from '../storage/storage.service';
import { QueueService, JobType } from '../queues/queue.service';
import { User } from '@prisma/client';

@Injectable()
export class ClaimsService {
  constructor(
    private readonly db: DbService,
    private readonly storage: StorageService,
    private readonly queue: QueueService,
  ) {}

  async create(data: any, user: User, proofFile?: Express.Multer.File) {
    const item = await this.db.getItemById(data.item_id || data.itemId);
    if (!item) throw new NotFoundException('Item not found.');

    if (item.userId === user.id) {
      throw new BadRequestException('You cannot submit an ownership claim on your own report.');
    }

    const proofDetail = (data.private_proof_detail || data.privateProofDetail || '').trim();
    if (proofDetail.length < 8) {
      throw new BadRequestException('Private proof detail must be at least 8 characters long.');
    }

    let proofPhotoUrl = null;
    if (proofFile) {
      const upload = await this.storage.uploadSecureFile(proofFile);
      proofPhotoUrl = upload.url;
    }

    const claim = await this.db.createClaim({
      itemId: item.id,
      claimantId: user.id,
      privateProofDetail: proofDetail,
      privateProofPhotoUrl: proofPhotoUrl,
    });

    // Mark item status as CLAIM_PENDING
    if (item.status === 'OPEN') {
      await this.db.updateItem(item.id, { status: 'CLAIM_PENDING' });
    }

    // Enqueue BullMQ notification to item owner
    await this.queue.addJob(JobType.NOTIFICATION_DISPATCH, {
      userId: item.userId,
      title: `📩 New Claim: "${item.title}"`,
      message: `${user.name} submitted confidential verification proof for your item.`,
      linkUrl: `/my-posts`,
    });

    await this.db.createNotification({
      userId: item.userId,
      type: 'CLAIM_SUBMITTED',
      title: `📩 New Claim: "${item.title}"`,
      message: `${user.name} submitted confidential verification proof for your item.`,
      linkUrl: `/my-posts`,
    });

    return {
      message: 'Claim submitted successfully. Your proof details are shielded from public view.',
      claim,
    };
  }

  /**
   * STRICT PRIVACY GUARD: Only the item creator or a campus proctor can inspect claim details.
   */
  async getClaimsForItem(itemId: string, user: User) {
    const item = await this.db.getItemById(itemId);
    if (!item) throw new NotFoundException('Item not found.');

    const isOwner = item.userId === user.id;
    const isMod = user.role === 'MODERATOR' || user.role === 'ADMIN';

    if (!isOwner && !isMod) {
      throw new ForbiddenException(
        'Privacy Shield Violation: Only the item reporter and campus proctors are authorized to view private claims.',
      );
    }

    const claims = await this.db.getClaimsByItemId(itemId);
    return {
      itemTitle: item.title,
      secretPrompt: item.secretPrompt,
      claims,
    };
  }

  async getMyClaims(user: User) {
    const claims = await this.db.getClaimsByClaimantId(user.id);
    return { claims };
  }

  async review(
    claimId: string,
    status: string,
    user: User,
    notes?: string,
    pickupInstructions?: string,
  ) {
    const claim = await this.db.getClaimById(claimId);
    if (!claim) throw new NotFoundException('Claim not found.');

    const item = await this.db.getItemById(claim.itemId);
    if (!item) throw new NotFoundException('Associated item not found.');

    const isOwner = item.userId === user.id;
    const isMod = user.role === 'MODERATOR' || user.role === 'ADMIN';

    if (!isOwner && !isMod) {
      throw new ForbiddenException('Unauthorized: Only item reporter or proctor can review claims.');
    }

    const normalizedStatus = status.toUpperCase();
    if (!['APPROVED', 'REJECTED'].includes(normalizedStatus)) {
      throw new BadRequestException('Status must be APPROVED or REJECTED.');
    }

    const updated = await this.db.updateClaim(claimId, {
      status: normalizedStatus,
      reviewerNotes: notes || null,
      pickupInstructions: normalizedStatus === 'APPROVED' ? pickupInstructions || 'Contact finder.' : null,
    });

    if (normalizedStatus === 'APPROVED') {
      await this.db.updateItem(item.id, { status: 'RETURNED' });

      // Notify claimant with pickup instructions
      await this.queue.addJob(JobType.NOTIFICATION_DISPATCH, {
        userId: claim.claimantId,
        title: `🎉 Claim Approved for "${item.title}"!`,
        message: `Your proof was verified. Instructions: ${pickupInstructions || 'Coordinate with reporter.'}`,
        linkUrl: `/my-posts`,
      });

      await this.db.createNotification({
        userId: claim.claimantId,
        type: 'CLAIM_APPROVED',
        title: `🎉 Claim Approved for "${item.title}"!`,
        message: `Your proof was verified. Instructions: ${pickupInstructions || 'Coordinate with reporter.'}`,
        linkUrl: `/my-posts`,
      });
    }

    await this.db.logAuditEvent({
      actorId: user.id,
      actorRole: user.role,
      action: `CLAIM_${normalizedStatus}`,
      targetType: 'claim',
      targetId: claimId,
      details: { itemId: item.id, itemTitle: item.title, claimantId: claim.claimantId, pickupInstructions },
    });

    return { message: `Claim marked as ${normalizedStatus}.`, claim: updated };
  }
}
