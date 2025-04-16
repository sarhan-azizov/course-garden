import { TypeOrmModuleOptions } from '@nestjs/typeorm';

console.log("SARHAN", process.env);

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['src/**/*.entity.ts'],
  synchronize: false,
  // logging: process.env.NODE_ENV === 'development',
}); 