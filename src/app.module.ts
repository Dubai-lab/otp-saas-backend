import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/user.module';
import { SMTPModule } from './modules/smtp-config/smtp.module';
import { TemplateModule } from './modules/templates/template.module';
import { ApiKeyModule } from './modules/apikey/apikey.module';
import { OTPModule } from './modules/otp/otp.module';
import { LogModule } from './modules/logs/log.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
    }),
    AuthModule,
    UsersModule,
    SMTPModule,
    TemplateModule,
    ApiKeyModule,
    OTPModule,
    LogModule,
    AdminModule,
  ],
})
export class AppModule {}
