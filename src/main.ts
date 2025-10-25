import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS: allow dev origin and configurable production origin
  const defaultDevOrigin = 'http://localhost:5173';
  const frontendOrigin = process.env.FRONTEND_ORIGIN || defaultDevOrigin;
  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      if (!origin) return callback(null, true);
      const allowed = [
        frontendOrigin,
        defaultDevOrigin,
        'http://localhost:3000',
      ];
      if (allowed.includes(origin) || process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return callback(null, true);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return callback(new Error('Not allowed by CORS'), false);
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Lightweight health endpoint
  const httpAdapter = app.getHttpAdapter();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  httpAdapter.get('/health', (_req: unknown, res: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.json({ status: 'ok' });
  });

  await app.listen(process.env.PORT || 5000, '0.0.0.0');
  console.log(
    `🚀 Server running on http://localhost:${process.env.PORT || 5000}`,
  );
}

void bootstrap();
