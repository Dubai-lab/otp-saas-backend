import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(process.env.DATABASE_URL
    ? { url: process.env.DATABASE_URL }
    : {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      }),

  ssl: isProd ? true : false,

  synchronize: false,
  migrationsRun: true,

  entities: isProd
    ? ['dist/modules/**/*.entity.js']
    : ['src/modules/**/*.entity.ts'],

  migrations: isProd ? ['dist/migrations/*.js'] : ['src/migrations/*.ts'],

  logging: false,
});
