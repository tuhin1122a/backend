import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn((promises) => Promise.all(promises)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('upgradeVipTier', () => {
    it('should throw NotFoundException if user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.upgradeVipTier('user1', 'SILVER')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if target tier is invalid', async () => {
      const mockUser = { id: 'user1', vipTier: 'BRONZE', coins: 5000 };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Cast as any to pass an invalid tier
      await expect(service.upgradeVipTier('user1', 'INVALID' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when trying to downgrade or keep current tier', async () => {
      const mockUser = { id: 'user1', vipTier: 'GOLD', coins: 15000 };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.upgradeVipTier('user1', 'SILVER')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.upgradeVipTier('user1', 'GOLD')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if user has insufficient coins', async () => {
      const mockUser = { id: 'user1', vipTier: 'BRONZE', coins: 1500 }; // Silver costs 2000
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.upgradeVipTier('user1', 'SILVER')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should perform upgrade and log transaction if validation passes', async () => {
      const mockUser = { id: 'user1', vipTier: 'BRONZE', coins: 5000 };
      const updatedUserProfile = { id: 'user1', vipTier: 'SILVER', coins: 3000 };
      mockPrisma.user.findUnique.mockResolvedValueOnce(mockUser);
      mockPrisma.user.findUnique.mockResolvedValueOnce(updatedUserProfile); // returned by getMe

      const result = await service.upgradeVipTier('user1', 'SILVER');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: {
          coins: { decrement: 2000 },
          vipTier: 'SILVER',
        },
      });

      expect(mockPrisma.transaction.create).toHaveBeenCalledWith({
        data: {
          userId: 'user1',
          type: 'WITHDRAWAL',
          amount: 2000,
          status: 'APPROVED',
          method: 'VIP Upgrade to SILVER',
        },
      });

      expect(result).toEqual(updatedUserProfile);
    });
  });
});
