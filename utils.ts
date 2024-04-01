import { NextFunction, Request, Response } from 'express';
import * as fs from 'fs';
import * as EmailValidator from 'email-validator';
import jwt, { Secret } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

import { CreatedUser, NewUser } from './interfaces/user.interface';
import { Product } from './interfaces/product.interface';
import { Cart } from './interfaces/cart.interface';
import { returnError, ValidationErrors } from './constants/errors';
import { default as mockUsers } from './mocks/users.json';
import { default as mockProducts } from './mocks/products.json';
import { default as mockCarts } from './mocks/carts.json';

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

export const checkIfUserExist = (req: Request, res: Response, next: NextFunction) => {
    if (req.headers['x-user-id']) {
        let user = {} as CreatedUser;
        if (!!mockUsers.length) {
            user = mockUsers.find((user: CreatedUser) => user.id === req.headers['x-user-id']) || {} as CreatedUser;
            if (!user?.id) {
                return res.status(403).json(returnError(ValidationErrors.userIsNotAuthorized));
            }
        }

        next();
    } else {
        return res.status(403).json(returnError(ValidationErrors.userIsNotAuthorized));
    }
};

export const registerValidation = (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    let isExistingEmail = false;
    if (!!mockUsers.length) {
        isExistingEmail = mockUsers.some((user: CreatedUser) => user.email === email);
    }

    if (!email || isExistingEmail || !EmailValidator.validate(email)) {
        return res.status(400).json( returnError(ValidationErrors.invalidEmail) );
    }

    next();
}

export const loginValidation = (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!!mockUsers.length) {
        const user = mockUsers.find(elem => elem.email === email);
        if (!user) {
            return res.status(404).json( returnError(ValidationErrors.userNotExist) );
        }
    } else {
        return res.status(404).json( returnError(ValidationErrors.userNotExist) );
    }

    next();
}

export const checkProductByIdValidation = (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.params;
    const products: Product[] = mockProducts || [];
    let product: Product | undefined;
    if (products.length) {
        product = products.find((item: Product) => item.id === productId);
    }

    if (!product) {
        return res.status(404).json( returnError(ValidationErrors.noProductById) );
    }

    next();
}

export const updateCartValidation = (req: Request, res: Response, next: NextFunction) => {
    const { productId } = req.body;
    const userId = req.headers['x-user-id'] as string;

    let isExistingProduct = false;
    if (!!mockProducts.length) {
        isExistingProduct = mockProducts.some((product) => product.id === productId);
    }
    if (!isExistingProduct) {
        return res.status(400).json( returnError(ValidationErrors.invalidProduct) );
    }

    let carts: Cart[] = mockCarts || [];
    const cart = carts.find((item: Cart) => item.userId === userId) as Cart;
    if (!cart) {
        return res.status(404).json( returnError(ValidationErrors.cartNotFound) );
    }

    next();
}

export const cartNotEmpty = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    let carts: Cart[] = mockCarts || [];
    let cart;
    if (carts.length) {
        cart = carts.find((item: Cart) => item.userId === userId) as Cart;
    }

    if (!carts.length || !cart || cart.isDeleted || !cart?.items?.length) {
        return res.status(400).json( returnError(ValidationErrors.cartIsEmpty) );
    }

    next();
}