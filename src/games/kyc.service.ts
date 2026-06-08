import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KycService {
  constructor(private prisma: PrismaService) {}

  async findAll(status = '') {
    const where: any = {};
    if (status) where.status = status.toUpperCase();
    return this.prisma.kYC.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const kyc = await this.prisma.kYC.update({
      where: { id },
      data: { status, reviewedAt: new Date() },
      include: { user: true },
    });
    // Update user's kycStatus too
    await this.prisma.user.update({
      where: { id: kyc.userId },
      data: { kycStatus: status },
    });
    return kyc;
  }

  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.kYC.count(),
      this.prisma.kYC.count({ where: { status: 'PENDING' } }),
      this.prisma.kYC.count({ where: { status: 'APPROVED' } }),
      this.prisma.kYC.count({ where: { status: 'REJECTED' } }),
    ]);
    return { total, pending, approved, rejected };
  }

  submitKyc(data: { userId: string; documentType: string; documentUrl: string }) {
    return this.prisma.kYC.create({ data });
  }
}
