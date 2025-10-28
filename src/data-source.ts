import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // ✅ Single source to avoid mismatches
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false, // ✅ Required by Render
        }
      : false, // Disable SSL for local development

  entities: ['dist/modules/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],

  synchronize: false,
  migrationsRun: true,
  logging: true,
});
