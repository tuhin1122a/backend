import { Controller, Get, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CoinPackagesService } from './coin-packages.service';

@ApiTags('Coin Packages')
@Controller('coin-packages')
export class CoinPackagesController {
  constructor(private coinPackagesService: CoinPackagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active coin packages (mobile)' })
  findAllActive() {
    return this.coinPackagesService.findAllActive();
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get all coin packages (admin)' })
  findAll() {
    return this.coinPackagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coinPackagesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new coin package (admin)' })
  create(@Body() dto: any) {
    return this.coinPackagesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coin package details (admin)' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.coinPackagesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a coin package (admin)' })
  remove(@Param('id') id: string) {
    return this.coinPackagesService.remove(id);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Toggle coin package active status (admin)' })
  toggleActive(@Param('id') id: string) {
    return this.coinPackagesService.toggleActive(id);
  }
}
