import { Controller, Get, Post, Param, Patch, Query, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current logged-in user profile (mobile)' })
  getMe(@Request() req: any) {
    return this.usersService.getMe(req.user.userId);
  }

  @Post('claim-daily-bonus')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim daily login bonus (mobile)' })
  claimDailyBonus(@Request() req: any) {
    return this.usersService.claimDailyBonus(req.user.userId);
  }

  @Patch('upgrade-vip')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upgrade VIP Tier (mobile)' })
  upgradeVip(@Body('tier') tier: 'SILVER' | 'GOLD' | 'PLATINUM', @Request() req: any) {
    return this.usersService.upgradeVipTier(req.user.userId, tier);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search = '',
  ) {
    return this.usersService.findAll(+page, +limit, search);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  getStats() {
    return this.usersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/ban')
  @ApiOperation({ summary: 'Toggle user ban status' })
  toggleBan(@Param('id') id: string) {
    return this.usersService.toggleBan(id);
  }
}

