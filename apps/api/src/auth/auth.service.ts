import { Injectable, BadRequestException } from '@nestjs/common';
import { DbService } from '../prisma/db.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private readonly db: DbService) {}

  async listUsers(): Promise<User[]> {
    return this.db.getUsers();
  }

  async getProfile(userId: string): Promise<User | null> {
    return this.db.getUserById(userId);
  }

  async loginWithGoogle(data: { email: string; name: string; avatarUrl?: string; role?: string }): Promise<{ user: User; token: string }> {
    if (!data.email) {
      throw new BadRequestException('Email is required for Google authentication');
    }

    const user = await this.db.upsertGoogleUser({
      email: data.email,
      name: data.name || data.email.split('@')[0],
      avatarUrl: data.avatarUrl,
      role: data.role,
    });

    // Generate session token (user ID bearer)
    return {
      user,
      token: user.id,
    };
  }
}
