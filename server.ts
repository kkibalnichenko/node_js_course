import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { Server } from 'http';
import { Socket } from 'node:net';

import { router as healthRouter } from './controllers/health.controller';
import { router as productsRouter } from './controllers/products.controller';
import { router as cartRouter } from './controllers/cart.controller';
import { router as authRouter } from './controllers/auth.controller';
import { returnError, ValidationErrors } from './constants/errors';
import { AppDataSource } from './data-source';

dotenv.config({ path: path.join(__dirname, '/.env') });
const port = process.env.PORT || 8000;
const app: Express = express();
let server: Server;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/api/health', healthRouter);
app.use('/api/products', productsRouter);
app.use('/api/profile/cart', cartRouter);
app.use('/api/auth', authRouter);

(async () => {
    await AppDataSource.initialize().then(() => {
        console.log('Successfully connected to PostgreSQL');
        server = app.listen(port, () => console.log(`Listening at http://localhost:${port}`));
        let connections: Socket[] = [];
        server.on('connection', (connection: Socket) => {
            connections.push(connection);
            connection.on('close', () => {
                connections = connections.filter((currentConnection) => currentConnection !== connection);
            });
        });

        function gracefulShutdown() {
            console.log('Received kill signal, shutting down gracefully');

            server.close(() => {
                console.log('Closed out remaining connections');
                process.exit(0);
            });

            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);

            connections.forEach((connection) => connection.end());

            setTimeout(() => {
                connections.forEach((connection) => connection.destroy());
            }, 5000);
        }

        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    }).catch((error: Error) => {
        console.log(`Error connecting to PostgreSQL: ${error}`);
    });
})();

app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error();
    next(error);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send( returnError(ValidationErrors.serverError) );
});