import express, { NextFunction, Request, Response, Router } from 'express';

import { cartNotEmpty, checkAuth, checkIfUserExist, updateCartValidation } from '../utils';
import { checkoutUserCart, deleteUserCart, getUserCart, updateUserCart } from '../services/cart.service';

export const router: Router = express.Router();

router.get('/', checkAuth, checkIfUserExist, async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    try {
        const cart = await getUserCart(userId);
        return res.status(200).json(cart);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.put('/', checkAuth, checkIfUserExist, updateCartValidation, async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    try {
        const result = await updateUserCart(req.body, userId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.delete('/', checkAuth, checkIfUserExist, async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    try {
        const result = await deleteUserCart(userId);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.post('/checkout', checkAuth, checkIfUserExist, cartNotEmpty, async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    try {
        const checkout = await checkoutUserCart(userId);
        return res.status(200).json(checkout);
    } catch (err) {
        return res.status(500).json(err);
    }
});