import { Controller, Get, Body, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Aggregated admin dashboard stats' })
  async getStats() {
    const [totalUsers, activeUsers, pendingTxns, pendingKyc, activeInvestments, gameResults] =
      await Promise.all([
        this.prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
        this.prisma.user.count({ where: { role: { not: 'ADMIN' }, isActive: true } }),
        this.prisma.transaction.count({ where: { status: 'PENDING' } }),
        this.prisma.kYC.count({ where: { status: 'PENDING' } }),
        this.prisma.investment.findMany({ where: { status: 'ACTIVE' }, select: { amount: true } }),
        this.prisma.gameResult.findMany({ select: { reward: true } }),
      ]);

    const depositTxns = await this.prisma.transaction.findMany({
      where: { status: 'APPROVED', type: 'DEPOSIT' },
      select: { amount: true },
    });
    const totalRevenue = depositTxns.reduce((s, t) => s + t.amount, 0);
    const totalInvested = activeInvestments.reduce((s, i) => s + i.amount, 0);
    const rewardsGiven = gameResults.reduce((s, r) => s + r.reward, 0);

    const users = await this.prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      select: { coins: true },
    });
    const totalCoins = users.reduce((s, u) => s + u.coins, 0);

    return {
      users: { total: totalUsers, active: activeUsers, newToday: 2 },
      transactions: { pending: pendingTxns, totalRevenue },
      kyc: { pending: pendingKyc },
      investments: { active: activeInvestments.length, totalInvested },
      games: { totalPlays: gameResults.length, rewardsGiven },
      coins: { inCirculation: totalCoins },
    };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get system settings (admin)' })
  async getSettings() {
    let config = await this.prisma.systemConfig.findFirst();
    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: { welcomeBonus: 1000 },
      });
    }
    return config;
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update system settings (admin)' })
  async updateSettings(@Body() dto: { welcomeBonus?: number }) {
    let config = await this.prisma.systemConfig.findFirst();
    if (!config) {
      config = await this.prisma.systemConfig.create({
        data: { welcomeBonus: dto.welcomeBonus ?? 1000 },
      });
      return config;
    }

    return this.prisma.systemConfig.update({
      where: { id: config.id },
      data: dto,
    });
  }
}

