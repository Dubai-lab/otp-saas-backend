import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Allow frontend on Render
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://otp-saas-frontend.onrender.com',
      process.env.FRONTEND_ORIGIN,
    ],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ IMPORTANT: Run migrations ONCE to create tables
  // ✅ Healthcheck for Koyeb
  app.getHttpAdapter().get('/health', (_req, res) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return res.json({ status: 'ok' });
  });

  await app.listen(process.env.PORT || 5000, '0.0.0.0');
  console.log(`🚀 Backend running @ ${process.env.PORT || 5000}`);
}

void bootstrap();
