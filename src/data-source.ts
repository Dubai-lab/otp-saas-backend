import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,

  ssl: {
    rejectUnauthorized: false, // ✅ This fixes Render SSL issue completely
  },

  entities: ['dist/modules/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],

  synchronize: false,
  migrationsRun: true,
  logging: true,
});
