import { Controller, Get, Patch, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private txnService: TransactionsService) {}

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my transactions (mobile)' })
  getMyTransactions(@Request() req: any) {
    return this.txnService.findByUser(req.user.userId);
  }

  @Post('deposit')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create deposit request (mobile)' })
  deposit(@Body('amount') amount: number, @Body('method') method: string, @Request() req: any) {
    return this.txnService.create({ userId: req.user.userId, type: 'DEPOSIT', amount, method });
  }

  @Post('buy-coins')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buy coins instantly (mobile)' })
  buyCoins(@Body('amount') amount: number, @Body('costUSD') costUSD: number, @Request() req: any) {
    return this.txnService.buyCoins(req.user.userId, amount, costUSD);
  }

  @Post('withdraw')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create withdrawal request (mobile)' })
  withdraw(@Body('amount') amount: number, @Body('method') method: string, @Request() req: any) {
    return this.txnService.create({ userId: req.user.userId, type: 'WITHDRAWAL', amount, method });
  }

  @Get()
  @ApiOperation({ summary: 'List all transactions (admin)' })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('status') status = '',
  ) {
    return this.txnService.findAll(+page, +limit, status);
  }

  @Get('stats')
  getStats() { return this.txnService.getStats(); }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) { return this.txnService.findByUser(userId); }

  @Patch(':id/approve')
  approve(@Param('id') id: string) { return this.txnService.updateStatus(id, 'APPROVED'); }

  @Patch(':id/reject')
  reject(@Param('id') id: string) { return this.txnService.updateStatus(id, 'REJECTED'); }
}

