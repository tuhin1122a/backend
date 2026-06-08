import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BattleService } from './battle.service';

@ApiTags('Battle')
@Controller('battle')
export class BattleController {
  constructor(private battleService: BattleService) {}

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get top 10 leaderboard' })
  getLeaderboard() { return this.battleService.getLeaderboard(); }

  @Get('missions')
  getMissions() { return this.battleService.getMissions(); }

  @Patch('missions/:id/toggle')
  toggleMission(@Param('id') id: string) { return this.battleService.toggleMission(id); }

  @Patch('missions/:id')
  updateMission(@Param('id') id: string, @Body() dto: any) { return this.battleService.updateMission(id, dto); }
}
