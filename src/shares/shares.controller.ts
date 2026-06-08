import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SharesService } from './shares.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Shares')
@Controller('shares')
export class SharesController {
  constructor(private sharesService: SharesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active company shares (mobile)' })
  findAllActive() {
    return this.sharesService.findAllActive();
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get all shares (admin)' })
  findAll() {
    return this.sharesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sharesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company share (admin)' })
  create(@Body() dto: any) {
    return this.sharesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update share details (admin)' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.sharesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a share (admin)' })
  remove(@Param('id') id: string) {
    return this.sharesService.remove(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle share active status (admin)' })
  toggleActive(@Param('id') id: string) {
    return this.sharesService.toggleActive(id);
  }
}
