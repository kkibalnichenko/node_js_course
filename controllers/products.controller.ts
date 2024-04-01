import express, { NextFunction, Request, Response, Router } from 'express';

import { checkAuth, checkIfUserExist, checkProductByIdValidation } from '../utils';
import { getProductById, getProducts } from '../services/product.service';

export const router: Router = express.Router();

router.get('/', checkAuth, checkIfUserExist, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await getProducts();
        return res.status(200).json(products);
    } catch (err) {
        return res.status(500).json(err);
    }
});

router.get('/:productId', checkAuth, checkIfUserExist, checkProductByIdValidation, async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    try {
        const product = await getProductById(productId);
        return res.status(200).json(product);
    } catch (err) {
        return res.status(500).json(err);
    }
});