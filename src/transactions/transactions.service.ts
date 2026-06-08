import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, status = '') {
    const where: any = {};
    if (status) where.status = status.toUpperCase();

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.transaction.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const txn = await this.prisma.transaction.findUnique({ where: { id } });
    if (!txn) throw new Error('Transaction not found');
    if (txn.status !== 'PENDING') throw new Error('Transaction already processed');

    if (status === 'APPROVED') {
      const increment = txn.type === 'DEPOSIT' ? txn.amount : -txn.amount;
      await this.prisma.user.update({
        where: { id: txn.userId },
        data: { coins: { increment } },
      });
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status },
    });
  }

  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.transaction.count(),
      this.prisma.transaction.count({ where: { status: 'PENDING' } }),
      this.prisma.transaction.count({ where: { status: 'APPROVED' } }),
      this.prisma.transaction.count({ where: { status: 'REJECTED' } }),
    ]);

    const deposits = await this.prisma.transaction.findMany({
      where: { status: 'APPROVED', type: 'DEPOSIT' },
      select: { amount: true },
    });
    const withdrawals = await this.prisma.transaction.findMany({
      where: { status: 'APPROVED', type: 'WITHDRAWAL' },
      select: { amount: true },
    });

    const totalDeposits = deposits.reduce((s, t) => s + t.amount, 0);
    const totalWithdrawals = withdrawals.reduce((s, t) => s + t.amount, 0);

    return {
      total, pending, approved, rejected,
      totalDeposits, totalWithdrawals,
      netFlow: totalDeposits - totalWithdrawals,
    };
  }

  create(data: { userId: string; type: any; amount: number; method?: string }) {
    return this.prisma.transaction.create({ data });
  }

  async buyCoins(userId: string, amount: number, costUSD: number) {
    const [txn, user] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          userId,
          type: 'DEPOSIT',
          amount,
          status: 'APPROVED',
          method: `In-App Purchase ($${costUSD.toFixed(2)})`,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { coins: { increment: amount } },
      }),
    ]);
    return { txn, newBalance: user.coins };
  }
}
