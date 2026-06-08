import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.plan.findMany({ orderBy: { createdAt: 'asc' } });
  }

  findOne(id: string) {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  create(dto: {
    name: string; risk: 'LOW' | 'MED' | 'HIGH';
    returnRate: string; returnPercent: number;
    duration: string; durationDays: number; minCoins: number;
  }) {
    return this.prisma.plan.create({ data: dto });
  }

  update(id: string, dto: any) {
    return this.prisma.plan.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.prisma.plan.delete({ where: { id } });
    return { success: true };
  }

  async toggleActive(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) return null;
    return this.prisma.plan.update({
      where: { id },
      data: { isActive: !plan.isActive },
    });
  }

  async invest(userId: string, planId: string, amount: number) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) throw new BadRequestException('Plan not found or inactive');
    if (amount < plan.minCoins) throw new BadRequestException(`Minimum investment is ${plan.minCoins} coins`);

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { coins: true } });
    if (!user || user.coins < amount) throw new BadRequestException('Insufficient coins');

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const [investment] = await this.prisma.$transaction([
      this.prisma.investment.create({
        data: { userId, planId, amount, endDate },
        include: { plan: true },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { coins: { decrement: amount } },
      }),
      this.prisma.transaction.create({
        data: { userId, type: 'DEPOSIT', amount, status: 'APPROVED', method: `Plan: ${plan.name}` },
      }),
    ]);

    return investment;
  }

  getUserInvestments(userId: string) {
    return this.prisma.investment.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
