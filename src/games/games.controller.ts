import { Controller, Get, Patch, Post, Body, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GamesService } from './games.service';
import { KycService } from './kyc.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private gamesService: GamesService) {}

  @Get('config') getConfig() { return this.gamesService.getConfig(); }
  @Patch('config') updateConfig(@Body() dto: any) { return this.gamesService.updateConfig(dto); }
  @Get('results') getResults(@Query('page') p = '1', @Query('limit') l = '10') {
    return this.gamesService.getResults(+p, +l);
  }
  @Get('stats') getStats() { return this.gamesService.getStats(); }

  @Post('spin')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Spin the wheel (mobile - uses JWT user)' })
  spin(@Request() req: any) { return this.gamesService.spin(req.user.userId); }

  @Post('scratch')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Scratch card (mobile - uses JWT user)' })
  scratch(@Request() req: any) { return this.gamesService.scratch(req.user.userId); }
}


@ApiTags('KYC')
@Controller('kyc')
export class KycController {
  constructor(private kycService: KycService) {}

  @Get()
  @ApiOperation({ summary: 'List KYC records' })
  findAll(@Query('status') status = '') { return this.kycService.findAll(status); }

  @Get('stats') getStats() { return this.kycService.getStats(); }

  @Patch(':id/approve') approve(@Param('id') id: string) { return this.kycService.updateStatus(id, 'APPROVED'); }
  @Patch(':id/reject') reject(@Param('id') id: string) { return this.kycService.updateStatus(id, 'REJECTED'); }

  @Post()
  submitKyc(@Body() dto: { userId: string; documentType: string; documentUrl: string }) {
    return this.kycService.submitKyc(dto);
  }
}
