import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SharesService {
  constructor(private prisma: PrismaService) {}

  // Get active shares for mobile app
  findAllActive() {
    return this.prisma.share.findMany({
      where: { isActive: true },
      orderBy: { ticker: 'asc' },
    });
  }

  // Get all shares for admin panel
  findAll() {
    return this.prisma.share.findMany({
      orderBy: { ticker: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.share.findUnique({ where: { id } });
  }

  create(dto: {
    name: string;
    ticker: string;
    price: number;
    change: number;
    prevPrices?: number[];
    logo: string;
    color: string;
  }) {
    const prevPrices = dto.prevPrices || [
      dto.price * 0.95,
      dto.price * 0.98,
      dto.price * 0.97,
      dto.price * 1.01,
      dto.price * 0.99,
      dto.price * 1.02,
      dto.price,
    ];
    return this.prisma.share.create({
      data: {
        ...dto,
        prevPrices,
      },
    });
  }

  async update(id: string, dto: any) {
    const share = await this.prisma.share.findUnique({ where: { id } });
    if (!share) throw new NotFoundException('Share not found');

    const data: any = { ...dto };
    if (dto.price !== undefined && dto.price !== share.price) {
      // Rotate prices array: add current price to history
      const history = [...share.prevPrices];
      history.shift(); // remove oldest
      history.push(dto.price); // append new
      data.prevPrices = history;
    }

    return this.prisma.share.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.prisma.share.delete({ where: { id } });
    return { success: true };
  }

  async toggleActive(id: string) {
    const share = await this.prisma.share.findUnique({ where: { id } });
    if (!share) throw new NotFoundException('Share not found');
    return this.prisma.share.update({
      where: { id },
      data: { isActive: !share.isActive },
    });
  }
}
