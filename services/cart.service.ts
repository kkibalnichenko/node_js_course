import { ErrorResponse } from '../interfaces/error.interface';
import { returnError, ValidationErrors } from '../constants/errors';
import { checkoutCart, deleteCart, getCart, updateCart } from '../repositories/cart.repository';
import { CartResponse, EmptySuccessResponse, UpdateCartRequestBody } from '../interfaces/cart.interface';
import { CheckoutResponse } from '../interfaces/order.interface';

export const getUserCart = async (userId: string): Promise<CartResponse | ErrorResponse> => {
    try {
        return await getCart(userId);
    } catch {
        return new Promise((resolve, reject) => {
            reject(returnError(ValidationErrors.serverError));
        });
    }
}

export const updateUserCart = async (data: UpdateCartRequestBody, userId: string): Promise<CartResponse | ErrorResponse> => {
    try {
        return await updateCart(data, userId);
    } catch {
        return new Promise((resolve, reject) => {
            reject(returnError(ValidationErrors.serverError));
        });
    }
}

export const deleteUserCart = async (userId: string): Promise<EmptySuccessResponse | ErrorResponse> => {
    try {
        return await deleteCart(userId);
    } catch {
        return new Promise((resolve, reject) => {
            reject(returnError(ValidationErrors.serverError));
        });
    }
}

export const checkoutUserCart = async (userId: string): Promise<CheckoutResponse | ErrorResponse> => {
    try {
        return await checkoutCart(userId);
    } catch {
        return new Promise((resolve, reject) => {
            reject(returnError(ValidationErrors.serverError));
        });
    }
}