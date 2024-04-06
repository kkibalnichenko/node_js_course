import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import * as dotenv from 'dotenv';

import { router as productsRouter } from './controllers/products.controller';
import { router as cartRouter } from './controllers/cart.controller';
import { router as authRouter } from './controllers/auth.controller';
import { returnError, ValidationErrors } from './constants/errors';

dotenv.config({ path: path.join(__dirname, '/.env') });
const port = process.env.PORT || 8000;
const app: Express = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/api/products', productsRouter);
app.use('/api/profile/cart', cartRouter);
app.use('/api/auth', authRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error();
    next(error);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send( returnError(ValidationErrors.serverError) );
});

app.listen(port, () => {
    console.log(`now listening on port ${port}`);
});