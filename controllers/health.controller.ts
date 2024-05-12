import express, { NextFunction, Request, Response, Router } from 'express';

import { checkHealth } from '../services/health.service';

export const router: Router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await checkHealth();
        return res.status(200).json({ message: 'Application is healthy' });
    } catch (err) {
        return res.status(500).json({ message: 'Error connecting to database' });
    }
});