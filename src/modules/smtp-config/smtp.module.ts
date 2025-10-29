import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SMTPConfig } from './smtp.entity';
import { SMTPService } from './smtp.service';
import { SMTPController } from './smtp.controller';
import { UsersModule } from '../users/user.module';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [TypeOrmModule.forFeature([SMTPConfig]), UsersModule, UsageModule],
  providers: [SMTPService],
  controllers: [SMTPController],
  exports: [SMTPService],
})
export class SMTPModule {}
