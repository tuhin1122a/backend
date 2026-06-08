import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    let config = await this.prisma.gameConfig.findFirst();
    if (!config) {
      // Create default config if not exists
      config = await this.prisma.gameConfig.create({
        data: {
          spinRewards: [100, 200, 500, 0, 1000, 50, 750, 0],
          luckyDrawTicketPrice: 500,
          luckyDrawPrize: 10000,
          dailySpinLimit: 3,
          dailyScratchLimit: 5,
        },
      });
    }
    return config;
  }

  async updateConfig(dto: any) {
    const config = await this.prisma.gameConfig.findFirst();
    if (!config) return this.prisma.gameConfig.create({ data: dto });
    return this.prisma.gameConfig.update({ where: { id: config.id }, data: dto });
  }

  async getResults(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.gameResult.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      this.prisma.gameResult.count(),
    ]);
    return { data, total };
  }

  async getStats() {
    const results = await this.prisma.gameResult.findMany({ select: { gameType: true, reward: true } });
    const totalRewardsGiven = results.reduce((s, r) => s + r.reward, 0);
    return {
      totalPlays: results.length,
      totalRewardsGiven,
      byGame: {
        spin: results.filter((r) => r.gameType === 'SPIN').length,
        scratch: results.filter((r) => r.gameType === 'SCRATCH').length,
        lucky_draw: results.filter((r) => r.gameType === 'LUCKY_DRAW').length,
      },
    };
  }

  async spin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.coins < 500) {
      throw new BadRequestException('Insufficient coins for spin. Minimum 500 coins required.');
    }

    const config = await this.getConfig();
    const rewards = config.spinRewards;
    const baseReward = rewards[Math.floor(Math.random() * rewards.length)];

    let multiplier = 1.0;
    if (user.vipTier === 'SILVER') multiplier = 1.1;
    else if (user.vipTier === 'GOLD') multiplier = 1.25;
    else if (user.vipTier === 'PLATINUM') multiplier = 1.5;

    const reward = Math.round(baseReward * multiplier);
    const netChange = reward - 500;

    await this.prisma.gameResult.create({ data: { userId, gameType: 'SPIN', reward } });
    await this.prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: netChange } },
    });
    return { reward };
  }

  async scratch(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    let multiplier = 1.0;
    if (user) {
      if (user.vipTier === 'SILVER') multiplier = 1.1;
      else if (user.vipTier === 'GOLD') multiplier = 1.25;
      else if (user.vipTier === 'PLATINUM') multiplier = 1.5;
    }

    const baseReward = [0, 100, 200, 500][Math.floor(Math.random() * 4)];
    const reward = Math.round(baseReward * multiplier);

    await this.prisma.gameResult.create({ data: { userId, gameType: 'SCRATCH', reward } });
    if (reward > 0) {
      await this.prisma.user.update({ where: { id: userId }, data: { coins: { increment: reward } } });
    }
    return { reward };
  }
}
