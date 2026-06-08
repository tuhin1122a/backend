import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoinPackagesService {
  constructor(private prisma: PrismaService) {}

  // Get active packages for mobile client (sorted by price)
  findAllActive() {
    return this.prisma.coinPackage.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  // Get all packages for admin panel
  findAll() {
    return this.prisma.coinPackage.findMany({
      orderBy: { price: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.coinPackage.findUnique({ where: { id } });
  }

  create(dto: {
    title: string;
    coins: number;
    price: number;
    desc: string;
    icon: string;
    color: string;
    popular?: boolean;
  }) {
    if (dto.price < 5) {
      throw new BadRequestException('Package price must be at least $5.00 USD');
    }

    return this.prisma.coinPackage.create({
      data: {
        ...dto,
        popular: dto.popular ?? false,
      },
    });
  }

  async update(id: string, dto: any) {
    const pkg = await this.prisma.coinPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Coin package not found');

    if (dto.price !== undefined && dto.price < 5) {
      throw new BadRequestException('Package price must be at least $5.00 USD');
    }

    return this.prisma.coinPackage.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.prisma.coinPackage.delete({ where: { id } });
    return { success: true };
  }

  async toggleActive(id: string) {
    const pkg = await this.prisma.coinPackage.findUnique({ where: { id } });
    if (!pkg) throw new NotFoundException('Coin package not found');
    return this.prisma.coinPackage.update({
      where: { id },
      data: { isActive: !pkg.isActive },
    });
  }
}
