import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private plansService: PlansService) {}

  @Get()
  @ApiOperation({ summary: 'Get all investment plans' })
  findAll() { return this.plansService.findAll(); }

  @Get('my-investments')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user investments (mobile)' })
  getMyInvestments(@Request() req: any) {
    return this.plansService.getUserInvestments(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.plansService.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create a new plan (admin)' })
  create(@Body() dto: any) { return this.plansService.create(dto); }

  @Post(':id/invest')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invest in a plan (mobile)' })
  invest(@Param('id') planId: string, @Body('amount') amount: number, @Request() req: any) {
    return this.plansService.invest(req.user.userId, planId, amount);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.plansService.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.plansService.remove(id); }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle plan active status' })
  toggleActive(@Param('id') id: string) { return this.plansService.toggleActive(id); }
}

