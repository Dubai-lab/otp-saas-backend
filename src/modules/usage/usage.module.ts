import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsageService } from './usage.service';
import { Usage } from './entities/usage.entity';
import { User } from '../users/user.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usage, User, Plan])],
  providers: [UsageService],
  exports: [UsageService],
})
export class UsageModule {}
