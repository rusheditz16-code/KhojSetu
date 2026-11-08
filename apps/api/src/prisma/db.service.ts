import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  SEED_USERS,
  SEED_ITEMS,
  SEED_CLAIMS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
} from './seed';
import { User, Item, Claim, Notification, AuditLog } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DbService {
  private readonly logger = new Logger(DbService.name);

  // In-memory fallback caches initialized from seed data
  private memoryUsers: User[] = [...SEED_USERS] as any;
  private memoryItems: Item[] = [...SEED_ITEMS] as any;
  private memoryClaims: Claim[] = [...SEED_CLAIMS] as any;
  private memoryNotifications: Notification[] = [...SEED_NOTIFICATIONS] as any;
  private memoryAuditLogs: AuditLog[] = [...SEED_AUDIT_LOGS] as any;

  constructor(private readonly prisma: PrismaService) {}

  // ================= USERS =================
  async getUsers(): Promise<User[]> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.user.findMany({ orderBy: { role: 'desc' } });
      } catch (e) {
        this.logger.warn(`Prisma query failed (${e.message}), using cache.`);
      }
    }
    return this.memoryUsers;
  }

  async getUserById(id: string): Promise<User | null> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.user.findUnique({ where: { id } });
      } catch (e) {
        // fallback
      }
    }
    return this.memoryUsers.find((u) => u.id === id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.user.findUnique({ where: { email } });
      } catch (e) {}
    }
    return this.memoryUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async upsertGoogleUser(data: { email: string; name: string; avatarUrl?: string; role?: string }): Promise<User> {
    const existing = await this.getUserByEmail(data.email);
    if (existing) {
      return existing;
    }

    const newUser: User = {
      id: `usr-google-${uuidv4().substring(0, 8)}`,
      name: data.name,
      email: data.email,
      role: data.role || (data.email.includes('proctor') || data.email.includes('mod') ? 'MODERATOR' : 'STUDENT'),
      studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      phoneContact: null,
      createdAt: new Date(),
    };

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.user.create({ data: newUser });
      } catch (e) {}
    }

    this.memoryUsers.push(newUser);
    return newUser;
  }

  // ================= ITEMS =================
  async getItems(filters: {
    type?: string;
    category?: string;
    zone?: string;
    status?: string;
    search?: string;
  } = {}): Promise<Item[]> {
    if (this.prisma.isConnected) {
      try {
        const where: any = {};
        if (filters.type && filters.type !== 'all') where.type = filters.type.toUpperCase();
        if (filters.category) where.category = filters.category;
        if (filters.zone) where.zone = filters.zone;
        if (filters.status) where.status = filters.status.toUpperCase();
        if (filters.search) {
          where.OR = [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
            { campusArea: { contains: filters.search, mode: 'insensitive' } },
          ];
        }
        return await this.prisma.item.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        }) as any;
      } catch (e) {
        this.logger.warn(`Prisma getItems failed (${e.message}), using cache.`);
      }
    }

    // In-memory filter
    return this.memoryItems.filter((i) => {
      if (filters.type && filters.type !== 'all' && i.type.toUpperCase() !== filters.type.toUpperCase()) return false;
      if (filters.category && i.category !== filters.category) return false;
      if (filters.zone && i.zone !== filters.zone) return false;
      if (filters.status && i.status.toUpperCase() !== filters.status.toUpperCase()) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const matches =
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.campusArea.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }

  async getItemById(id: string): Promise<Item | null> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.item.findUnique({
          where: { id },
          include: { user: true, claims: true },
        }) as any;
      } catch (e) {}
    }
    return this.memoryItems.find((i) => i.id === id) || null;
  }

  async createItem(data: Partial<Item>): Promise<Item> {
    const item: Item = {
      id: data.id || `itm-${uuidv4().substring(0, 8)}`,
      type: (data.type || 'LOST').toUpperCase(),
      title: data.title || 'Untitled Report',
      category: data.category || 'other',
      description: data.description || '',
      campusArea: data.campusArea || 'Campus Area',
      zone: data.zone || 'library',
      latitude: data.latitude || 12.9716,
      longitude: data.longitude || 77.5946,
      incidentDate: data.incidentDate ? new Date(data.incidentDate) : new Date(),
      photoUrl: data.photoUrl || null,
      photoKey: data.photoKey || null,
      secretPrompt: data.secretPrompt || null,
      status: (data.status || 'OPEN').toUpperCase(),
      userId: data.userId || 'usr-priya-01',
      isFlagged: false,
      flagReason: null,
      vectorEmbedding: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.item.create({ data: item });
      } catch (e) {
        this.logger.warn(`Prisma createItem failed: ${e.message}`);
      }
    }

    this.memoryItems.unshift(item);
    return item;
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.item.update({ where: { id }, data: updates });
      } catch (e) {}
    }

    const idx = this.memoryItems.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    this.memoryItems[idx] = { ...this.memoryItems[idx], ...updates, updatedAt: new Date() };
    return this.memoryItems[idx];
  }

  async deleteItem(id: string): Promise<boolean> {
    if (this.prisma.isConnected) {
      try {
        await this.prisma.item.delete({ where: { id } });
        return true;
      } catch (e) {}
    }
    const lenBefore = this.memoryItems.length;
    this.memoryItems = this.memoryItems.filter((i) => i.id !== id);
    return this.memoryItems.length < lenBefore;
  }

  // ================= CLAIMS =================
  async getClaimsByItemId(itemId: string): Promise<Claim[]> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.claim.findMany({
          where: { itemId },
          include: { claimant: true },
          orderBy: { createdAt: 'desc' },
        }) as any;
      } catch (e) {}
    }
    return this.memoryClaims.filter((c) => c.itemId === itemId);
  }

  async getClaimsByClaimantId(claimantId: string): Promise<any[]> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.claim.findMany({
          where: { claimantId },
          include: { item: true },
          orderBy: { createdAt: 'desc' },
        });
      } catch (e) {}
    }

    return this.memoryClaims
      .filter((c) => c.claimantId === claimantId)
      .map((c) => {
        const item = this.memoryItems.find((i) => i.id === c.itemId);
        return { ...c, item };
      });
  }

  async getClaimById(id: string): Promise<Claim | null> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.claim.findUnique({
          where: { id },
          include: { item: true, claimant: true },
        }) as any;
      } catch (e) {}
    }
    return this.memoryClaims.find((c) => c.id === id) || null;
  }

  async createClaim(data: Partial<Claim>): Promise<Claim> {
    const claim: Claim = {
      id: data.id || `clm-${uuidv4().substring(0, 8)}`,
      itemId: data.itemId!,
      claimantId: data.claimantId!,
      privateProofDetail: data.privateProofDetail!,
      privateProofPhotoUrl: data.privateProofPhotoUrl || null,
      status: 'PENDING',
      reviewerNotes: null,
      pickupInstructions: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.claim.create({ data: claim });
      } catch (e) {}
    }

    this.memoryClaims.unshift(claim);
    return claim;
  }

  async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.claim.update({ where: { id }, data: updates });
      } catch (e) {}
    }

    const idx = this.memoryClaims.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.memoryClaims[idx] = { ...this.memoryClaims[idx], ...updates, updatedAt: new Date() };
    return this.memoryClaims[idx];
  }

  // ================= NOTIFICATIONS =================
  async getNotifications(userId: string): Promise<Notification[]> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (e) {}
    }
    return this.memoryNotifications.filter((n) => n.userId === userId);
  }

  async createNotification(data: Partial<Notification>): Promise<Notification> {
    const notif: Notification = {
      id: data.id || `notif-${uuidv4().substring(0, 8)}`,
      userId: data.userId!,
      type: data.type || 'ALERT',
      title: data.title || '',
      message: data.message || '',
      linkUrl: data.linkUrl || null,
      isRead: false,
      createdAt: new Date(),
    };

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.notification.create({ data: notif });
      } catch (e) {}
    }

    this.memoryNotifications.unshift(notif);
    return notif;
  }

  async markNotificationRead(id: string): Promise<void> {
    if (this.prisma.isConnected) {
      try {
        await this.prisma.notification.update({ where: { id }, data: { isRead: true } });
        return;
      } catch (e) {}
    }
    const notif = this.memoryNotifications.find((n) => n.id === id);
    if (notif) notif.isRead = true;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    if (this.prisma.isConnected) {
      try {
        await this.prisma.notification.updateMany({ where: { userId }, data: { isRead: true } });
        return;
      } catch (e) {}
    }
    this.memoryNotifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
  }

  // ================= AUDIT LOGS =================
  async logAuditEvent(data: {
    actorId: string;
    actorRole: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: any;
  }): Promise<AuditLog> {
    const log: AuditLog = {
      id: `aud-${uuidv4().substring(0, 8)}`,
      actorId: data.actorId,
      actorRole: data.actorRole,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      details: data.details ? (typeof data.details === 'string' ? data.details : JSON.stringify(data.details)) : null,
      createdAt: new Date(),
    };

    if (this.prisma.isConnected) {
      try {
        return await this.prisma.auditLog.create({ data: log });
      } catch (e) {}
    }

    this.memoryAuditLogs.unshift(log);
    return log;
  }

  async getAuditLogs(limit = 100): Promise<any[]> {
    if (this.prisma.isConnected) {
      try {
        return await this.prisma.auditLog.findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { actor: true },
        });
      } catch (e) {}
    }

    return this.memoryAuditLogs.slice(0, limit).map((log) => {
      const actor = this.memoryUsers.find((u) => u.id === log.actorId);
      return {
        ...log,
        actor_name: actor?.name || 'Proctor',
        actor_email: actor?.email || 'admin@campus.edu',
      };
    });
  }

  // ================= STATS =================
  async getModerationStats() {
    const totalReports = this.memoryItems.length;
    const openLost = this.memoryItems.filter((i) => i.type === 'LOST' && i.status === 'OPEN').length;
    const openFound = this.memoryItems.filter((i) => i.type === 'FOUND' && i.status === 'OPEN').length;
    const returnedCount = this.memoryItems.filter((i) => i.status === 'RETURNED').length;
    const pendingClaims = this.memoryClaims.filter((c) => c.status === 'PENDING').length;
    const flaggedCount = this.memoryItems.filter((i) => i.isFlagged).length;

    return {
      totalReports,
      openLost,
      openFound,
      returnedCount,
      pendingClaims,
      flaggedCount,
    };
  }
}
