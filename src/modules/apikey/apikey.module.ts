import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiKey } from './apikey.entity';
import { ApiKeyService } from './apikey.service';
import { ApiKeyController } from './apikey.controller';
import { UsersModule } from '../users/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([ApiKey]), UsersModule],
  controllers: [ApiKeyController],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
