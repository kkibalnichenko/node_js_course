import { DataSource } from 'typeorm';
import { join } from 'path';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'node_gmp',
    password: 'password123',
    database: 'node_gmp',
    entities: [join(__dirname, '**', '*.entity.{ts,js}')],
    subscribers: [],
    migrations: [],
    synchronize: true,
    logging: true,
});