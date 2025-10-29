import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './apikey.entity';
import { ApiKeyService } from './apikey.service';
import { ApiKeyController } from './apikey.controller';
import { UsersModule } from '../users/user.module';
import { SMTPModule } from '../smtp-config/smtp.module';
import { UsageModule } from '../usage/usage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiKey]),
    UsersModule,
    SMTPModule,
    UsageModule,
  ],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
