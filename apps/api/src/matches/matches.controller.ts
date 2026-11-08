import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { DbService } from '../prisma/db.service';

@Controller('api/matches')
export class MatchesController {
  constructor(
    private readonly matchingService: MatchingService,
    private readonly db: DbService,
  ) {}

  @Get('dashboard/highlights')
  async getHighlights() {
    const lost = await this.db.getItems({ type: 'LOST', status: 'OPEN' });
    const found = await this.db.getItems({ type: 'FOUND', status: 'OPEN' });

    const highlights: any[] = [];
    for (const l of lost) {
      for (const f of found) {
        const res = this.matchingService.computeMatch(l, f);
        if (res.score >= 50) {
          highlights.push({
            lostItem: l,
            foundItem: f,
            ...res,
          });
        }
      }
    }

    highlights.sort((a, b) => b.score - a.score);
    return { highlights: highlights.slice(0, 10) };
  }

  @Get(':itemId')
  async getMatchesForItem(
    @Param('itemId') itemId: string,
    @Query('minScore') minScore = '30',
  ) {
    const target = await this.db.getItemById(itemId);
    if (!target) throw new NotFoundException('Target item not found');

    const oppositeItems = await this.db.getItems({
      type: target.type === 'LOST' ? 'FOUND' : 'LOST',
      status: 'OPEN',
    });

    const matches = this.matchingService.rankMatches(
      target,
      oppositeItems,
      parseInt(minScore, 10),
    );

    return {
      targetItem: target,
      matchesCount: matches.length,
      matches,
    };
  }
}
