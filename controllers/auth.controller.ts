import express, { Request, Response, Router } from 'express';

import { createUser, loginUser } from '../services/user.service';
import { loginValidation, registerValidation } from '../utils';

export const router: Router = express.Router();

router.post('/register', registerValidation, async (req: Request, res: Response) => {
    try {
        const user = await createUser(req.body);
        return res.status(200).json(user);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.post('/login', loginValidation, async (req: Request, res: Response) => {
    try {
        const result = await loginUser(req.body);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json(err);
    }
});