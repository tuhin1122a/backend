import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BattleService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      where: { role: { not: 'ADMIN' }, isActive: true },
      orderBy: { coins: 'desc' },
      take: 10,
      select: { id: true, name: true, coins: true, vipTier: true, streak: true },
    });
    return users.map((u, i) => ({ rank: i + 1, userId: u.id, ...u }));
  }

  getMissions() {
    return this.prisma.mission.findMany({ orderBy: { type: 'asc' } });
  }

  async toggleMission(id: string) {
    const mission = await this.prisma.mission.findUnique({ where: { id } });
    if (!mission) return null;
    return this.prisma.mission.update({
      where: { id },
      data: { isActive: !mission.isActive },
    });
  }

  updateMission(id: string, dto: any) {
    return this.prisma.mission.update({ where: { id }, data: dto });
  }

  createMission(dto: {
    title: string; description: string;
    reward: number; type: any; target: number;
  }) {
    return this.prisma.mission.create({ data: dto });
  }
}
