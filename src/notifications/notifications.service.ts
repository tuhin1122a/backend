import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId?: string) {
    const where: any = {};
    if (userId) where.OR = [{ userId }, { isBroadcast: true }];
    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } },
    });
  }

  send(dto: { userId: string; title: string; body: string }) {
    return this.prisma.notification.create({
      data: { userId: dto.userId, title: dto.title, body: dto.body, isBroadcast: false },
    });
  }

  sendToAll(dto: { title: string; body: string }) {
    return this.prisma.notification.create({
      data: { title: dto.title, body: dto.body, isBroadcast: true },
    });
  }

  markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }
}
