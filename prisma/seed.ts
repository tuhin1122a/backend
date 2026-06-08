import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.investment.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.kYC.deleteMany({});
  await prisma.gameResult.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.mission.deleteMany({});
  await prisma.gameConfig.deleteMany({});
  await prisma.systemConfig.deleteMany({});
  await prisma.share.deleteMany({});
  await prisma.coinPackage.deleteMany({});

  // 2. Create Users
  console.log('👤 Seeding users...');
  const userPasswordHash = await bcrypt.hash('password123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  const usersData = [
    {
      aliasId: 'u1',
      name: 'Alex Rahman',
      email: 'alex@example.com',
      password: userPasswordHash,
      role: 'USER' as const,
      coins: 125000,
      vipTier: 'GOLD' as const,
      kycStatus: 'APPROVED' as const,
      referralCode: 'ALEX2024',
      streak: 14,
      isActive: true,
      createdAt: new Date('2024-01-15'),
    },
    {
      aliasId: 'u2',
      name: 'Sara Ahmed',
      email: 'sara@example.com',
      password: userPasswordHash,
      role: 'USER' as const,
      coins: 89500,
      vipTier: 'SILVER' as const,
      kycStatus: 'APPROVED' as const,
      referralCode: 'SARA2024',
      streak: 7,
      isActive: true,
      createdAt: new Date('2024-02-20'),
    },
    {
      aliasId: 'u3',
      name: 'Rahim Hossain',
      email: 'rahim@example.com',
      password: userPasswordHash,
      role: 'USER' as const,
      coins: 210000,
      vipTier: 'PLATINUM' as const,
      kycStatus: 'APPROVED' as const,
      referralCode: 'RAHIM2024',
      streak: 30,
      isActive: true,
      createdAt: new Date('2023-11-05'),
    },
    {
      aliasId: 'u4',
      name: 'Nadia Islam',
      email: 'nadia@example.com',
      password: userPasswordHash,
      role: 'USER' as const,
      coins: 45000,
      vipTier: 'BRONZE' as const,
      kycStatus: 'PENDING' as const,
      referralCode: 'NADIA2024',
      streak: 3,
      isActive: true,
      createdAt: new Date('2024-05-10'),
    },
    {
      aliasId: 'u5',
      name: 'Karim Uddin',
      email: 'karim@example.com',
      password: userPasswordHash,
      role: 'USER' as const,
      coins: 67000,
      vipTier: 'SILVER' as const,
      kycStatus: 'REJECTED' as const,
      referralCode: 'KARIM2024',
      streak: 0,
      isActive: false,
      createdAt: new Date('2024-03-18'),
    },
    {
      aliasId: 'u6',
      name: 'Priya Das',
      email: 'priya@example.com',
      password: userPasswordHash,
      role: 'USER' as const,
      coins: 155000,
      vipTier: 'GOLD' as const,
      kycStatus: 'APPROVED' as const,
      referralCode: 'PRIYA2024',
      streak: 21,
      isActive: true,
      createdAt: new Date('2024-01-28'),
    },
    {
      aliasId: 'u7',
      name: 'Tanvir Chowdhury',
      email: 'tanvir@example.com',
      password: userPasswordHash,
      role: 'USER' as const,
      coins: 32000,
      vipTier: 'BRONZE' as const,
      kycStatus: 'NONE' as const,
      referralCode: 'TANVIR2024',
      streak: 1,
      isActive: true,
      createdAt: new Date('2024-06-01'),
    },
    {
      aliasId: 'admin1',
      name: 'Super Admin',
      email: 'admin@coinvest.com',
      password: adminPasswordHash,
      role: 'ADMIN' as const,
      coins: 0,
      vipTier: 'PLATINUM' as const,
      kycStatus: 'APPROVED' as const,
      referralCode: 'ADMIN',
      streak: 0,
      isActive: true,
      createdAt: new Date('2023-01-01'),
    },
  ];

  const userMap: Record<string, string> = {};

  for (const u of usersData) {
    const { aliasId, ...data } = u;
    const created = await prisma.user.create({ data });
    userMap[aliasId] = created.id;
  }

  // 3. Create Plans
  console.log('📈 Seeding plans...');
  const plansData = [
    {
      aliasId: 'p1',
      name: 'Safe Harbor Plan',
      risk: 'LOW' as const,
      returnRate: '8–12% / week',
      returnPercent: 10,
      duration: '7 days',
      durationDays: 7,
      minCoins: 1000,
      isActive: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      aliasId: 'p2',
      name: 'Growth Engine Plan',
      risk: 'MED' as const,
      returnRate: '18–25% / week',
      returnPercent: 21,
      duration: '7 days',
      durationDays: 7,
      minCoins: 5000,
      isActive: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      aliasId: 'p3',
      name: 'Rocket Fuel Plan',
      risk: 'HIGH' as const,
      returnRate: '35–50% / week',
      returnPercent: 42,
      duration: '7 days',
      durationDays: 7,
      minCoins: 10000,
      isActive: true,
      createdAt: new Date('2024-01-01'),
    },
  ];

  const planMap: Record<string, string> = {};

  for (const p of plansData) {
    const { aliasId, ...data } = p;
    const created = await prisma.plan.create({ data });
    planMap[aliasId] = created.id;
  }

  // 4. Create Investments
  console.log('💸 Seeding investments...');
  const investmentsData = [
    {
      userAlias: 'u1',
      planAlias: 'p2',
      amount: 15000,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-08'),
      status: 'ACTIVE' as const,
      createdAt: new Date('2024-06-01'),
    },
    {
      userAlias: 'u3',
      planAlias: 'p3',
      amount: 50000,
      startDate: new Date('2024-05-28'),
      endDate: new Date('2024-06-04'),
      status: 'COMPLETED' as const,
      createdAt: new Date('2024-05-28'),
    },
    {
      userAlias: 'u6',
      planAlias: 'p1',
      amount: 8000,
      startDate: new Date('2024-06-03'),
      endDate: new Date('2024-06-10'),
      status: 'ACTIVE' as const,
      createdAt: new Date('2024-06-03'),
    },
  ];

  for (const inv of investmentsData) {
    await prisma.investment.create({
      data: {
        userId: userMap[inv.userAlias],
        planId: planMap[inv.planAlias],
        amount: inv.amount,
        startDate: inv.startDate,
        endDate: inv.endDate,
        status: inv.status,
        createdAt: inv.createdAt,
      },
    });
  }

  // 5. Create Transactions
  console.log('💳 Seeding transactions...');
  const transactionsData = [
    {
      userAlias: 'u1',
      type: 'DEPOSIT' as const,
      amount: 50000,
      status: 'APPROVED' as const,
      method: 'bKash',
      createdAt: new Date('2024-06-01'),
    },
    {
      userAlias: 'u2',
      type: 'DEPOSIT' as const,
      amount: 30000,
      status: 'PENDING' as const,
      method: 'Nagad',
      createdAt: new Date('2024-06-05'),
    },
    {
      userAlias: 'u3',
      type: 'WITHDRAWAL' as const,
      amount: 25000,
      status: 'APPROVED' as const,
      method: 'Bank Transfer',
      createdAt: new Date('2024-06-02'),
    },
    {
      userAlias: 'u4',
      type: 'DEPOSIT' as const,
      amount: 10000,
      status: 'PENDING' as const,
      method: 'bKash',
      createdAt: new Date('2024-06-06'),
    },
    {
      userAlias: 'u5',
      type: 'WITHDRAWAL' as const,
      amount: 15000,
      status: 'REJECTED' as const,
      method: 'Bank Transfer',
      createdAt: new Date('2024-05-30'),
    },
    {
      userAlias: 'u6',
      type: 'REWARD' as const,
      amount: 500,
      status: 'APPROVED' as const,
      createdAt: new Date('2024-06-04'),
    },
  ];

  for (const tx of transactionsData) {
    await prisma.transaction.create({
      data: {
        userId: userMap[tx.userAlias],
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        method: tx.method,
        createdAt: tx.createdAt,
      },
    });
  }

  // 6. Create KYC Records
  console.log('📄 Seeding KYC records...');
  const kycRecordsData = [
    {
      userAlias: 'u4',
      documentType: 'nid',
      documentUrl: 'https://placeholder.com/kyc/u4-nid.jpg',
      status: 'PENDING' as const,
      createdAt: new Date('2024-06-05'),
    },
    {
      userAlias: 'u1',
      documentType: 'nid',
      documentUrl: 'https://placeholder.com/kyc/u1-nid.jpg',
      status: 'APPROVED' as const,
      reviewedAt: new Date('2024-01-20'),
      createdAt: new Date('2024-01-18'),
    },
    {
      userAlias: 'u5',
      documentType: 'passport',
      documentUrl: 'https://placeholder.com/kyc/u5-passport.jpg',
      status: 'REJECTED' as const,
      reviewedAt: new Date('2024-04-01'),
      createdAt: new Date('2024-03-28'),
    },
  ];

  for (const k of kycRecordsData) {
    await prisma.kYC.create({
      data: {
        userId: userMap[k.userAlias],
        documentType: k.documentType,
        documentUrl: k.documentUrl,
        status: k.status,
        reviewedAt: k.reviewedAt,
        createdAt: k.createdAt,
      },
    });
  }

  // 7. Create Game Results
  console.log('🎮 Seeding game results...');
  const gameResultsData = [
    { userAlias: 'u1', gameType: 'SPIN' as const, reward: 500, createdAt: new Date('2024-06-05') },
    { userAlias: 'u2', gameType: 'SCRATCH' as const, reward: 200, createdAt: new Date('2024-06-05') },
    { userAlias: 'u3', gameType: 'LUCKY_DRAW' as const, reward: 5000, createdAt: new Date('2024-06-04') },
    { userAlias: 'u6', gameType: 'SPIN' as const, reward: 1000, createdAt: new Date('2024-06-03') },
    { userAlias: 'u1', gameType: 'SCRATCH' as const, reward: 100, createdAt: new Date('2024-06-02') },
  ];

  for (const gr of gameResultsData) {
    await prisma.gameResult.create({
      data: {
        userId: userMap[gr.userAlias],
        gameType: gr.gameType,
        reward: gr.reward,
        createdAt: gr.createdAt,
      },
    });
  }

  // 8. Create Game Config
  console.log('⚙️ Seeding game config...');
  await prisma.gameConfig.create({
    data: {
      spinWheelEnabled: true,
      scratchCardEnabled: true,
      luckyDrawEnabled: true,
      spinRewards: [100, 200, 500, 0, 1000, 50, 750, 0],
      luckyDrawTicketPrice: 500,
      luckyDrawPrize: 10000,
      dailySpinLimit: 3,
      dailyScratchLimit: 5,
    },
  });

  // 9. Create Missions
  console.log('⚔️ Seeding missions...');
  const missionsData = [
    {
      title: 'Daily Investor',
      description: 'Invest coins in any plan today',
      reward: 250,
      type: 'DAILY' as const,
      target: 1,
      isActive: true,
    },
    {
      title: 'Spin Master',
      description: 'Spin the wheel 3 times',
      reward: 150,
      type: 'DAILY' as const,
      target: 3,
      isActive: true,
    },
    {
      title: 'Weekly Warrior',
      description: 'Win 5 battles this week',
      reward: 1000,
      type: 'WEEKLY' as const,
      target: 5,
      isActive: true,
    },
    {
      title: 'Referral Champion',
      description: 'Refer 3 friends this month',
      reward: 2000,
      type: 'SPECIAL' as const,
      target: 3,
      isActive: true,
    },
  ];

  for (const m of missionsData) {
    await prisma.mission.create({ data: m });
  }

  // 10. Create Notifications
  console.log('🔔 Seeding notifications...');
  await prisma.notification.create({
    data: {
      isBroadcast: true,
      title: '🚀 Flash Sale is LIVE!',
      body: "Get 20% bonus coins on deposits for the next 24 hours. Don't miss out!",
      isRead: false,
      createdAt: new Date('2024-06-06'),
    },
  });

  await prisma.notification.create({
    data: {
      userId: userMap['u1'],
      isBroadcast: false,
      title: '✅ KYC Approved',
      body: 'Your identity verification has been approved. You can now withdraw funds.',
      isRead: true,
      createdAt: new Date('2024-01-20'),
    },
  });

  // 11. Create SystemConfig
  console.log('⚙️ Seeding system config...');
  await prisma.systemConfig.create({
    data: {
      welcomeBonus: 1000,
    },
  });

  // 12. Create Shares
  console.log('📈 Seeding shares...');
  const sharesData = [
    { name: 'Apple Inc.', ticker: 'AAPL', price: 185.0, change: 2.4, prevPrices: [178, 180, 179, 182, 181, 183, 185], logo: '🍎', color: '#ffebed' },
    { name: 'Tesla Inc.', ticker: 'TSLA', price: 240.0, change: -3.1, prevPrices: [255, 252, 248, 245, 246, 242, 240], logo: '⚡', color: '#fff9db' },
    { name: 'Alphabet Inc.', ticker: 'GOOGL', price: 150.0, change: 0.8, prevPrices: [148, 149, 147, 150, 149, 148, 150], logo: '🔍', color: '#e8f4e8' },
    { name: 'Microsoft Corp.', ticker: 'MSFT', price: 320.0, change: 1.5, prevPrices: [310, 312, 315, 313, 316, 318, 320], logo: '💻', color: '#e8f4f8' },
    { name: 'Amazon.com Inc.', ticker: 'AMZN', price: 135.0, change: -1.2, prevPrices: [139, 138, 136, 137, 135, 136, 135], logo: '📦', color: '#fff3ee' },
  ];

  for (const s of sharesData) {
    await prisma.share.create({ data: s });
  }

  // 13. Create CoinPackages
  console.log('📦 Seeding coin packages...');
  const coinPackagesData = [
    { title: 'Starter Pack', coins: 5000, price: 50.0, desc: 'Perfect for testing small strategies', icon: 'shield', color: '#e0f4dc', popular: false },
    { title: 'Trader Pack', coins: 15000, price: 150.0, desc: 'Includes 20% bonus coins!', icon: 'chart-bar', color: '#fdecd4', popular: true },
    { title: 'Whale Vault Pack', coins: 85000, price: 850.0, desc: 'Includes 30% bonus coins!', icon: 'rocket', color: '#fde0d4', popular: false },
  ];

  for (const cp of coinPackagesData) {
    await prisma.coinPackage.create({ data: cp });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
