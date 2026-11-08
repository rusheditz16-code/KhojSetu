import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('users')
  async listUsers() {
    const users = await this.authService.listUsers();
    return { users };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    return { user: req.user };
  }

  @Post('google')
  async loginWithGoogle(
    @Body('email') email: string,
    @Body('name') name: string,
    @Body('avatarUrl') avatarUrl: string,
    @Body('role') role?: string,
  ) {
    return this.authService.loginWithGoogle({ email, name, avatarUrl, role });
  }
}
