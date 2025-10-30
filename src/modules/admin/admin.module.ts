import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/user.module';
import { LogModule } from '../logs/log.module';
import { SMTPModule } from '../smtp-config/smtp.module';
import { ApiKeyModule } from '../apikey/apikey.module';
import { TemplateModule } from '../templates/template.module';
import { PlanModule } from '../plans/plan.module';

@Module({
  imports: [
    UsersModule,
    LogModule,
    SMTPModule,
    ApiKeyModule,
    TemplateModule,
    PlanModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
