import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTPService } from './otp.service';
import { OTPController } from './otp.controller';
import { SendLog } from '../logs/log.entity';
import { ApiKeyModule } from '../apikey/apikey.module';
import { SMTPModule } from '../smtp-config/smtp.module';
import { TemplateModule } from '../templates/template.module';
import { LogModule } from '../logs/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SendLog]),
    ApiKeyModule,
    SMTPModule,
    TemplateModule,
    LogModule,
  ],
  controllers: [OTPController],
  providers: [OTPService],
})
export class OTPModule {}
