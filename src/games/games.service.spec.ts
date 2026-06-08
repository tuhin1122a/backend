import { Test, TestingModule } from '@nestjs/testing';
import { GamesService } from './games.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('GamesService', () => {
  let service: GamesService;
  let prisma: PrismaService;

  const mockPrisma = {
    gameConfig: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    gameResult: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfig = {
    id: 'config1',
    spinRewards: [1000], // single value for predictability in tests
    luckyDrawTicketPrice: 500,
    luckyDrawPrize: 10000,
    dailySpinLimit: 3,
    dailyScratchLimit: 5,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  describe('spin', () => {
    it('should throw BadRequestException if user is not found or has insufficient coins', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(service.spin('user1')).rejects.toThrow(BadRequestException);

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', coins: 499 });
      await expect(service.spin('user1')).rejects.toThrow(BadRequestException);
    });

    it('should apply 1.0x multiplier for BRONZE tier', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', vipTier: 'BRONZE', coins: 1000 });
      mockPrisma.gameConfig.findFirst.mockResolvedValue(mockConfig);

      const res = await service.spin('user1');
      // baseReward = 1000. reward = Math.round(1000 * 1.0) = 1000.
      expect(res.reward).toBe(1000);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { coins: { increment: 500 } }, // 1000 reward - 500 cost = 500 net change
      });
    });

    it('should apply 1.1x multiplier for SILVER tier', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', vipTier: 'SILVER', coins: 1000 });
      mockPrisma.gameConfig.findFirst.mockResolvedValue(mockConfig);

      const res = await service.spin('user1');
      // baseReward = 1000. reward = Math.round(1000 * 1.1) = 1100.
      expect(res.reward).toBe(1100);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { coins: { increment: 600 } }, // 1100 reward - 500 cost = 600 net change
      });
    });

    it('should apply 1.25x multiplier for GOLD tier', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', vipTier: 'GOLD', coins: 1000 });
      mockPrisma.gameConfig.findFirst.mockResolvedValue(mockConfig);

      const res = await service.spin('user1');
      // baseReward = 1000. reward = Math.round(1000 * 1.25) = 1250.
      expect(res.reward).toBe(1250);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { coins: { increment: 750 } }, // 1250 reward - 500 cost = 750 net change
      });
    });

    it('should apply 1.5x multiplier for PLATINUM tier', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', vipTier: 'PLATINUM', coins: 1000 });
      mockPrisma.gameConfig.findFirst.mockResolvedValue(mockConfig);

      const res = await service.spin('user1');
      // baseReward = 1000. reward = Math.round(1000 * 1.5) = 1500.
      expect(res.reward).toBe(1500);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { coins: { increment: 1000 } }, // 1500 reward - 500 cost = 1000 net change
      });
    });
  });

  describe('scratch', () => {
    it('should apply correct multiplier based on tier', async () => {
      // Mock math random to return a predictable index.
      // baseReward options: [0, 100, 200, 500]
      // Let's stub Math.random to return 0.75 (so index 3, which is 500)
      const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.75);

      // BRONZE: 500 * 1.0 = 500
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', vipTier: 'BRONZE' });
      let res = await service.scratch('user1');
      expect(res.reward).toBe(500);

      // SILVER: 500 * 1.1 = 550
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', vipTier: 'SILVER' });
      res = await service.scratch('user1');
      expect(res.reward).toBe(550);

      // GOLD: 500 * 1.25 = 625
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', vipTier: 'GOLD' });
      res = await service.scratch('user1');
      expect(res.reward).toBe(625);

      // PLATINUM: 500 * 1.5 = 750
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user1', vipTier: 'PLATINUM' });
      res = await service.scratch('user1');
      expect(res.reward).toBe(750);

      randomSpy.mockRestore();
    });
  });
});
