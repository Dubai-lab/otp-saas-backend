import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,

  synchronize: false,
  migrationsRun: true,

  entities: isProd
    ? ['dist/modules/**/*.entity.js']
    : ['src/modules/**/*.entity.ts'],

  migrations: isProd ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],

  logging: false,
});
