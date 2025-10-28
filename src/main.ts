import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { AppDataSource } from './data-source';

dotenv.config();

async function bootstrap() {
  // 🧠 Ensure DB is initialized before Nest starts
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Database connected successfully!');
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1); // Stop app if DB fails
  }

  const app = await NestFactory.create(AppModule);

  // ✅ Global prefix for versioning (optional)
  app.setGlobalPrefix('api');

  // ✅ Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      forbidNonWhitelisted: false,
      transform: true, // auto-transform payloads to DTOs
    }),
  );

  // ✅ CORS setup (important for frontend calls)
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://your-frontend-name.onrender.com',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
  });

  // ✅ Define the port
  const port = process.env.PORT || 5000;

  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
}

bootstrap();
