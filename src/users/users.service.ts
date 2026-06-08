import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search = '') {
    const where: any = {
      role: { not: 'ADMIN' },
    };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, email: true, role: true, coins: true,
          vipTier: true, kycStatus: true, streak: true, claimedDays: true, isActive: true,
          referralCode: true, createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, coins: true,
        vipTier: true, kycStatus: true, streak: true, claimedDays: true, isActive: true,
        referralCode: true, createdAt: true,
        investments: { include: { plan: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 10 },
        gameResults: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async getMe(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true, coins: true,
        vipTier: true, kycStatus: true, streak: true, claimedDays: true, isActive: true,
        referralCode: true, createdAt: true,
        investments: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
        notifications: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
  }

  async addCoins(userId: string, amount: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { coins: { increment: amount } },
      select: { id: true, coins: true },
    });
  }

  async deductCoins(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
    if (!user || user.coins < amount) throw new Error('Insufficient coins');
    return this.prisma.user.update({
      where: { id: userId },
      data: { coins: { decrement: amount } },
      select: { id: true, coins: true },
    });
  }

  async incrementStreak(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { streak: { increment: 1 } },
      select: { id: true, streak: true },
    });
  }

  async toggleBan(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });
  }

  async getStats() {
    const [total, active, banned, kycPending] = await Promise.all([
      this.prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      this.prisma.user.count({ where: { role: { not: 'ADMIN' }, isActive: true } }),
      this.prisma.user.count({ where: { role: { not: 'ADMIN' }, isActive: false } }),
      this.prisma.user.count({ where: { role: { not: 'ADMIN' }, kycStatus: 'PENDING' } }),
    ]);
    const vipBreakdown = await Promise.all([
      this.prisma.user.count({ where: { role: { not: 'ADMIN' }, vipTier: 'BRONZE' } }),
      this.prisma.user.count({ where: { role: { not: 'ADMIN' }, vipTier: 'SILVER' } }),
      this.prisma.user.count({ where: { role: { not: 'ADMIN' }, vipTier: 'GOLD' } }),
      this.prisma.user.count({ where: { role: { not: 'ADMIN' }, vipTier: 'PLATINUM' } }),
    ]);
    return {
      total, active, banned, kycPending,
      vipBreakdown: { bronze: vipBreakdown[0], silver: vipBreakdown[1], gold: vipBreakdown[2], platinum: vipBreakdown[3] },
    };
  }

  async claimDailyBonus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('User not found');

    const DAILY_REWARDS = [5, 10, 10, 10, 10, 10, 10]; // Day 1: 5 coins, Days 2-7: 10 coins

    // Calculate current day number relative to registration (1-indexed)
    const start = new Date(user.createdAt);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - start.getTime();
    const currentDay = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    if (currentDay > 7) {
      throw new Error('Daily login bonus period has expired.');
    }

    if (user.claimedDays.includes(currentDay)) {
      throw new Error('Daily login bonus for today has already been claimed.');
    }

    const reward = DAILY_REWARDS[currentDay - 1];

    // Update user balance, push currentDay to claimedDays, increment streak
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        coins: { increment: reward },
        claimedDays: { push: currentDay },
        streak: { increment: 1 },
      },
    });

    // Create a transaction log
    await this.prisma.transaction.create({
      data: {
        userId,
        type: 'REWARD',
        amount: reward,
        status: 'APPROVED',
        method: `Daily Login Bonus (Day ${currentDay})`,
      },
    });

    return this.getMe(userId);
  }

  async upgradeVipTier(userId: string, targetTier: 'SILVER' | 'GOLD' | 'PLATINUM') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const PRICING = {
      SILVER: 2000,
      GOLD: 10000,
      PLATINUM: 30000,
    };

    const cost = PRICING[targetTier];
    if (!cost) throw new BadRequestException('Invalid VIP Tier selection');

    const tiers = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
    const currentIdx = tiers.indexOf(user.vipTier);
    const targetIdx = tiers.indexOf(targetTier);

    if (targetIdx <= currentIdx) {
      throw new BadRequestException('You are already at this tier or a higher tier.');
    }

    if (user.coins < cost) {
      throw new BadRequestException(`Insufficient coins. You need ${cost.toLocaleString()} coins to upgrade to ${targetTier}.`);
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: {
          coins: { decrement: cost },
          vipTier: targetTier,
        },
      }),
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'WITHDRAWAL',
          amount: cost,
          status: 'APPROVED',
          method: `VIP Upgrade to ${targetTier}`,
        },
      }),
    ]);

    return this.getMe(userId);
  }
}
