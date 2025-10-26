import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppDataSource } from './data-source';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  console.log('📌 Bootstrapping backend…');

  try {
    // ✅ Initialize DB
    await AppDataSource.initialize();
    console.log('✅ Database initialized');

    // ✅ Run all pending migrations
    await AppDataSource.runMigrations();
    console.log('✅ Migrations executed');
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    console.error('❌ Database init/migration error:', err?.message || err);
    process.exit(1); // Stop server if DB fails
  }

  const app = await NestFactory.create(AppModule);

  // ✅ Allow frontend connection
  const allowedOrigins = [
    process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    'http://localhost:3000',
  ];
  app.enableCors({
    origin: (origin, callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (!origin || allowedOrigins.includes(origin)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return callback(null, true);
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
      return callback(new Error('Blocked by CORS'), false);
    },
    credentials: true,
  });

  // ✅ DTO validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ✅ Health check
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/health', (_req: unknown, res: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    res.json({ status: 'ok' });
  });

  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`✅ Backend running at http://localhost:${port}`);
}

void bootstrap();
