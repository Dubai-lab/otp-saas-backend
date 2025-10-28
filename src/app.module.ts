import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Import feature modules
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
    // ✅ Load environment variables globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // ✅ Production-grade TypeORM config using DATABASE_URL
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        if (!process.env.DATABASE_URL) {
          throw new Error(
            '❌ DATABASE_URL is missing! Please set it in your environment variables.',
          );
        }

        console.log('🔗 Connecting to database using DATABASE_URL');

        return {
          type: 'postgres',
          url: process.env.DATABASE_URL,
          ssl:
            process.env.NODE_ENV === 'production'
              ? { rejectUnauthorized: false }
              : false,

          // ✅ Automatically load all entities and migrations
          autoLoadEntities: true,
          migrationsRun: true,
          synchronize: false, // Never true in production
          logging: true,
        };
      },
    }),

    // ✅ Application modules
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
