import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/user.module';
import { LogModule } from '../logs/log.module';

@Module({
  imports: [UsersModule, LogModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
