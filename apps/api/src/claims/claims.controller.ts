import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClaimsService } from './claims.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('api/claims')
@UseGuards(AuthGuard)
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('proof_photo'))
  async create(
    @Body() body: any,
    @Req() req: any,
    @UploadedFile() proofPhoto?: Express.Multer.File,
  ) {
    return this.claimsService.create(body, req.user, proofPhoto);
  }

  @Get('item/:itemId')
  async getClaimsForItem(@Param('itemId') itemId: string, @Req() req: any) {
    return this.claimsService.getClaimsForItem(itemId, req.user);
  }

  @Get('my')
  async getMyClaims(@Req() req: any) {
    return this.claimsService.getMyClaims(req.user);
  }

  @Patch(':id/review')
  async review(
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('reviewer_notes') notes: string,
    @Body('pickup_instructions') pickupInstructions: string,
    @Req() req: any,
  ) {
    return this.claimsService.review(id, status, req.user, notes, pickupInstructions);
  }
}
