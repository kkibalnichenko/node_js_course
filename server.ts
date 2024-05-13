import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';
import 'reflect-metadata';
import { Server } from 'http';
import { Socket } from 'node:net';
import winston from 'winston';
import morgan from 'morgan';

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
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.cli(),
    transports: [ new winston.transports.Console() ],
});
const morganMiddleware = morgan(
    ':date[web] INFO :method :url - :response-time ms',
    { stream: { write: (message) => logger.info(message.trim()) }}
);

app.use(morganMiddleware);
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
        logger.debug('Successfully connected to PostgreSQL');
        server = app.listen(port, () => logger.info(`Listening at http://localhost:${port}`));
        let connections: Socket[] = [];
        server.on('connection', (connection: Socket) => {
            connections.push(connection);
            connection.on('close', () => {
                connections = connections.filter((currentConnection) => currentConnection !== connection);
            });
        });

        function gracefulShutdown() {
            logger.debug('Received kill signal, shutting down gracefully');

            server.close(() => {
                logger.info('Closed out remaining connections');
                process.exit(0);
            });

            setTimeout(() => {
                logger.error('Could not close connections in time, forcefully shutting down');
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
        logger.error(`Error connecting to PostgreSQL: ${error}`);
    });
})();

app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error();
    next(error);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(error);
    res.status(500).send( returnError(ValidationErrors.serverError) );
});