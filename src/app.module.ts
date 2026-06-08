import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { TransactionsModule } from './transactions/transactions.module';
import { GamesModule } from './games/games.module';
import { BattleModule } from './battle/battle.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { SharesModule } from './shares/shares.module';
import { CoinPackagesModule } from './coin-packages/coin-packages.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PlansModule,
    TransactionsModule,
    GamesModule,
    BattleModule,
    AnalyticsModule,
    NotificationsModule,
    AdminModule,
    SharesModule,
    CoinPackagesModule,
  ],
})
export class AppModule {}
