import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',

  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  ssl: true, // ✅ Force SSL in Render ALWAYS
  extra: {
    ssl: {
      rejectUnauthorized: false, // ✅ Required by Render PostgreSQL
    },
  },

  entities: isProd
    ? ['dist/modules/**/*.entity.js']
    : ['src/modules/**/*.entity.ts'],

  migrations: isProd ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],

  synchronize: false,
  migrationsRun: true,
  logging: false,
});
