// ============================================================
// SHARED SEED DATA — used across all modules (in-memory store)
// ============================================================

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // hashed
  role: 'user' | 'admin';
  coins: number;
  vipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  kycStatus: 'pending' | 'approved' | 'rejected' | 'none';
  referralCode: string;
  streak: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  risk: 'low' | 'med' | 'hi';
  returnRate: string;
  returnPercent: number;
  duration: string;
  durationDays: number;
  minCoins: number;
  isActive: boolean;
  createdAt: Date;
}

export interface Investment {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'reward' | 'game_win';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method?: string;
  createdAt: Date;
}

export interface KYC {
  id: string;
  userId: string;
  documentType: 'nid' | 'passport' | 'driving_license';
  documentUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt?: Date;
  createdAt: Date;
}

export interface GameResult {
  id: string;
  userId: string;
  gameType: 'spin' | 'scratch' | 'lucky_draw';
  reward: number;
  createdAt: Date;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  reward: number;
  type: 'daily' | 'weekly' | 'special';
  target: number;
  isActive: boolean;
}

export interface Notification {
  id: string;
  userId: string | 'all';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: Date;
}

// ============================================================
// SEED DATA
// ============================================================

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Rahman',
    email: 'alex@example.com',
    password: '$2b$10$hashedpassword1',
    role: 'user',
    coins: 125000,
    vipTier: 'gold',
    kycStatus: 'approved',
    referralCode: 'ALEX2024',
    streak: 14,
    isActive: true,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'u2',
    name: 'Sara Ahmed',
    email: 'sara@example.com',
    password: '$2b$10$hashedpassword2',
    role: 'user',
    coins: 89500,
    vipTier: 'silver',
    kycStatus: 'approved',
    referralCode: 'SARA2024',
    streak: 7,
    isActive: true,
    createdAt: new Date('2024-02-20'),
  },
  {
    id: 'u3',
    name: 'Rahim Hossain',
    email: 'rahim@example.com',
    password: '$2b$10$hashedpassword3',
    role: 'user',
    coins: 210000,
    vipTier: 'platinum',
    kycStatus: 'approved',
    referralCode: 'RAHIM2024',
    streak: 30,
    isActive: true,
    createdAt: new Date('2023-11-05'),
  },
  {
    id: 'u4',
    name: 'Nadia Islam',
    email: 'nadia@example.com',
    password: '$2b$10$hashedpassword4',
    role: 'user',
    coins: 45000,
    vipTier: 'bronze',
    kycStatus: 'pending',
    referralCode: 'NADIA2024',
    streak: 3,
    isActive: true,
    createdAt: new Date('2024-05-10'),
  },
  {
    id: 'u5',
    name: 'Karim Uddin',
    email: 'karim@example.com',
    password: '$2b$10$hashedpassword5',
    role: 'user',
    coins: 67000,
    vipTier: 'silver',
    kycStatus: 'rejected',
    referralCode: 'KARIM2024',
    streak: 0,
    isActive: false,
    createdAt: new Date('2024-03-18'),
  },
  {
    id: 'u6',
    name: 'Priya Das',
    email: 'priya@example.com',
    password: '$2b$10$hashedpassword6',
    role: 'user',
    coins: 155000,
    vipTier: 'gold',
    kycStatus: 'approved',
    referralCode: 'PRIYA2024',
    streak: 21,
    isActive: true,
    createdAt: new Date('2024-01-28'),
  },
  {
    id: 'u7',
    name: 'Tanvir Chowdhury',
    email: 'tanvir@example.com',
    password: '$2b$10$hashedpassword7',
    role: 'user',
    coins: 32000,
    vipTier: 'bronze',
    kycStatus: 'none',
    referralCode: 'TANVIR2024',
    streak: 1,
    isActive: true,
    createdAt: new Date('2024-06-01'),
  },
  {
    id: 'admin1',
    name: 'Super Admin',
    email: 'admin@coinvest.com',
    password: '$2b$10$hashedadminpassword',
    role: 'admin',
    coins: 0,
    vipTier: 'platinum',
    kycStatus: 'approved',
    referralCode: 'ADMIN',
    streak: 0,
    isActive: true,
    createdAt: new Date('2023-01-01'),
  },
];

export const PLANS: Plan[] = [
  {
    id: 'p1',
    name: 'Safe Harbor Plan',
    risk: 'low',
    returnRate: '8–12% / week',
    returnPercent: 10,
    duration: '7 days',
    durationDays: 7,
    minCoins: 1000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'p2',
    name: 'Growth Engine Plan',
    risk: 'med',
    returnRate: '18–25% / week',
    returnPercent: 21,
    duration: '7 days',
    durationDays: 7,
    minCoins: 5000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'p3',
    name: 'Rocket Fuel Plan',
    risk: 'hi',
    returnRate: '35–50% / week',
    returnPercent: 42,
    duration: '7 days',
    durationDays: 7,
    minCoins: 10000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
  },
];

export const INVESTMENTS: Investment[] = [
  {
    id: 'inv1',
    userId: 'u1',
    planId: 'p2',
    amount: 15000,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-08'),
    status: 'active',
    createdAt: new Date('2024-06-01'),
  },
  {
    id: 'inv2',
    userId: 'u3',
    planId: 'p3',
    amount: 50000,
    startDate: new Date('2024-05-28'),
    endDate: new Date('2024-06-04'),
    status: 'completed',
    createdAt: new Date('2024-05-28'),
  },
  {
    id: 'inv3',
    userId: 'u6',
    planId: 'p1',
    amount: 8000,
    startDate: new Date('2024-06-03'),
    endDate: new Date('2024-06-10'),
    status: 'active',
    createdAt: new Date('2024-06-03'),
  },
];

export const TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    userId: 'u1',
    type: 'deposit',
    amount: 50000,
    status: 'approved',
    method: 'bKash',
    createdAt: new Date('2024-06-01'),
  },
  {
    id: 't2',
    userId: 'u2',
    type: 'deposit',
    amount: 30000,
    status: 'pending',
    method: 'Nagad',
    createdAt: new Date('2024-06-05'),
  },
  {
    id: 't3',
    userId: 'u3',
    type: 'withdrawal',
    amount: 25000,
    status: 'approved',
    method: 'Bank Transfer',
    createdAt: new Date('2024-06-02'),
  },
  {
    id: 't4',
    userId: 'u4',
    type: 'deposit',
    amount: 10000,
    status: 'pending',
    method: 'bKash',
    createdAt: new Date('2024-06-06'),
  },
  {
    id: 't5',
    userId: 'u5',
    type: 'withdrawal',
    amount: 15000,
    status: 'rejected',
    method: 'Bank Transfer',
    createdAt: new Date('2024-05-30'),
  },
  {
    id: 't6',
    userId: 'u6',
    type: 'reward',
    amount: 500,
    status: 'approved',
    createdAt: new Date('2024-06-04'),
  },
];

export const KYC_RECORDS: KYC[] = [
  {
    id: 'kyc1',
    userId: 'u4',
    documentType: 'nid',
    documentUrl: 'https://placeholder.com/kyc/u4-nid.jpg',
    status: 'pending',
    createdAt: new Date('2024-06-05'),
  },
  {
    id: 'kyc2',
    userId: 'u1',
    documentType: 'nid',
    documentUrl: 'https://placeholder.com/kyc/u1-nid.jpg',
    status: 'approved',
    reviewedAt: new Date('2024-01-20'),
    createdAt: new Date('2024-01-18'),
  },
  {
    id: 'kyc3',
    userId: 'u5',
    documentType: 'passport',
    documentUrl: 'https://placeholder.com/kyc/u5-passport.jpg',
    status: 'rejected',
    reviewedAt: new Date('2024-04-01'),
    createdAt: new Date('2024-03-28'),
  },
];

export const GAME_RESULTS: GameResult[] = [
  { id: 'g1', userId: 'u1', gameType: 'spin', reward: 500, createdAt: new Date('2024-06-05') },
  { id: 'g2', userId: 'u2', gameType: 'scratch', reward: 200, createdAt: new Date('2024-06-05') },
  { id: 'g3', userId: 'u3', gameType: 'lucky_draw', reward: 5000, createdAt: new Date('2024-06-04') },
  { id: 'g4', userId: 'u6', gameType: 'spin', reward: 1000, createdAt: new Date('2024-06-03') },
  { id: 'g5', userId: 'u1', gameType: 'scratch', reward: 100, createdAt: new Date('2024-06-02') },
];

export const MISSIONS: Mission[] = [
  {
    id: 'm1',
    title: 'Daily Investor',
    description: 'Invest coins in any plan today',
    reward: 250,
    type: 'daily',
    target: 1,
    isActive: true,
  },
  {
    id: 'm2',
    title: 'Spin Master',
    description: 'Spin the wheel 3 times',
    reward: 150,
    type: 'daily',
    target: 3,
    isActive: true,
  },
  {
    id: 'm3',
    title: 'Weekly Warrior',
    description: 'Win 5 battles this week',
    reward: 1000,
    type: 'weekly',
    target: 5,
    isActive: true,
  },
  {
    id: 'm4',
    title: 'Referral Champion',
    description: 'Refer 3 friends this month',
    reward: 2000,
    type: 'special',
    target: 3,
    isActive: true,
  },
];

export const NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'all',
    title: '🚀 Flash Sale is LIVE!',
    body: 'Get 20% bonus coins on deposits for the next 24 hours. Don\'t miss out!',
    isRead: false,
    createdAt: new Date('2024-06-06'),
  },
  {
    id: 'n2',
    userId: 'u1',
    title: '✅ KYC Approved',
    body: 'Your identity verification has been approved. You can now withdraw funds.',
    isRead: true,
    createdAt: new Date('2024-01-20'),
  },
];

export const GAME_CONFIG = {
  spinWheelEnabled: true,
  scratchCardEnabled: true,
  luckyDrawEnabled: true,
  spinRewards: [100, 200, 500, 0, 1000, 50, 750, 0],
  luckyDrawTicketPrice: 500,
  luckyDrawPrize: 10000,
  dailySpinLimit: 3,
  dailyScratchLimit: 5,
};
