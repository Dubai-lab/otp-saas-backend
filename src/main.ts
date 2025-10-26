import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppDataSource } from './data-source';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  console.log('📌 Bootstrapping backend…');

  // ✅ Ensure DB is ready + run pending migrations
  await AppDataSource.initialize()
    .then(() => {
      console.log('✅ Database initialized');
      return AppDataSource.runMigrations();
    })
    .then(() => console.log('✅ Migrations executed'))
    .catch((err) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('❌ Database init/migration error:', err?.message || err),
    );

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

  // ✅ Simple health check endpoint
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
