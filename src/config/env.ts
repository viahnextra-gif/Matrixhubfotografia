import dotenv from 'dotenv';

dotenv.config();

export type AppConfig = {
  port: number;
  env: 'development' | 'production' | 'test';
  corsOrigins: string[];
};

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig: AppConfig = {
  port: parseNumber(process.env.PORT, 4000),
  env: (process.env.NODE_ENV as AppConfig['env']) || 'development',
  corsOrigins: process.env.CORS_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) || ['*'],
};
