import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

import { getDatabaseConfig } from './database.config';

config();

export const AppDataSource = new DataSource({
    ...getDatabaseConfig() as DataSourceOptions,
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
});