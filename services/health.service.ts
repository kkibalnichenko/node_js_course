import mysql, { ConnectionOptions } from 'mysql2';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '/.env') });

const dbConfig: ConnectionOptions = {
    host:  process.env.DB_HOST || 'localhost',
    user:  process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
};

export const checkHealth = async () => {
    const pool = mysql.createPool(dbConfig);
    pool.promise();

    return pool.getConnection((err, connection) => {
        if (err) {
            return err;
        }

        connection.release();
    });
}