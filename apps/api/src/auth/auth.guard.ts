import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { DbService } from '../prisma/db.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly db: DbService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userIdHeader = request.headers['x-user-id'];
    const authHeader = request.headers['authorization'];

    let targetUserId = userIdHeader;
    if (!targetUserId && authHeader && authHeader.startsWith('Bearer ')) {
      targetUserId = authHeader.split(' ')[1];
    }

    // Default to student persona (Priya) if unauthenticated for smooth demo experience
    if (!targetUserId) {
      targetUserId = 'usr-priya-01';
    }

    const user = await this.db.getUserById(targetUserId);
    if (!user) {
      throw new UnauthorizedException('User session not found.');
    }

    request.user = user;
    return true;
  }
}

@Injectable()
export class ModeratorGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || (user.role !== 'MODERATOR' && user.role !== 'ADMIN')) {
      throw new ForbiddenException('Campus Proctor / Moderator credentials required.');
    }
    return true;
  }
}
