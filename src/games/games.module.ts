import { Module } from '@nestjs/common';
import { GamesController, KycController } from './games.controller';
import { GamesService } from './games.service';
import { KycService } from './kyc.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GamesController, KycController],
  providers: [GamesService, KycService],
  exports: [GamesService, KycService],
})
export class GamesModule {}

