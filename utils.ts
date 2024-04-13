import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as EmailValidator from 'email-validator';
import jwt, { Secret } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

import { NewUser } from './interfaces/user.interface';
import { Cart } from './interfaces/cart.interface';
import { returnError, ValidationErrors } from './constants/errors';
import { getUserByEmail, getUserById} from './repositories/user.repository';
import { getProductById } from './repositories/product.repository';
import { getCart } from './repositories/cart.repository';

const JWT_KEY = process.env.JWT_KEY as Secret;

export const writeToFile = (file: string, content: NewUser[] | Cart[]) => {
    try {
        fs.writeFileSync(file, JSON.stringify(content), 'utf8');
    } catch(error) {
        console.error(error);
    }
}

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.headers.authorization) {
            const token: string = req.headers.authorization.split(' ')[1];
            jwt.verify(token, JWT_KEY);

            next();
        } else {
            return res.status(403).json(returnError(ValidationErrors.userIsNotAuthorized));
        }
    } catch {
        return res.status(401).json(returnError(ValidationErrors.noAuthorizationHeader));
    }
};

export const checkIfUserExist = async (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['x-user-id']) {
        const user = await getUserById(req.headers['x-user-id'] as string);
        if (!user) {
            return res.status(403).json(returnError(ValidationErrors.userIsNotAuthorized));
        }

        next();
    } else {
        return res.status(403).json(returnError(ValidationErrors.userIsNotAuthorized));
    }
};

export const registerValidation = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!email || user || !EmailValidator.validate(email)) {
        return res.status(400).json( returnError(ValidationErrors.invalidEmail) );
    }

    next();
}

export const loginValidation = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const user = await getUserByEmail(email);

    if (!user) {
        return res.status(404).json( returnError(ValidationErrors.userNotExist) );
    }

    next();
}

export const checkProductByIdValidation = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const product = await getProductById(productId);

    if (!product) {
        return res.status(404).json( returnError(ValidationErrors.noProductById) );
    }

    next();
}

export const updateCartValidation = async (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;
    const userId = req.headers['x-user-id'] as string;

    const product = await getProductById(productId);
    if (!product) {
        return res.status(400).json( returnError(ValidationErrors.invalidProduct) );
    }

    const cart = await getCart(userId);
    if (!cart) {
        return res.status(404).json( returnError(ValidationErrors.cartNotFound) );
    }

    next();
}

export const cartNotEmpty = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    const cartResponse = await getCart(userId);
    const cart = cartResponse?.data?.cart as Cart;

    if (!cart || cart?.isDeleted || !cart?.items?.length) {
        return res.status(400).json( returnError(ValidationErrors.cartIsEmpty) );
    }

    next();
}