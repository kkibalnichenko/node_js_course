import { DataSource } from 'typeorm';
import path, { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '/.env') });

type db_Type = 'postgres';

export const AppDataSource = new DataSource({
    type: ( process.env.DB_TYPE || 'postgres' ) as db_Type,
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT as unknown as number,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    subscribers: [],
    // migrations: [join(__dirname, '**', '*.migration.{ts,js}')],
    // synchronize: false,
    migrations: [],
    synchronize: true,
    logging: true,
});