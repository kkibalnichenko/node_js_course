import { ErrorResponse } from '../interfaces/error.interface';
import { returnError, ValidationErrors } from '../constants/errors';
import { getAll, getById } from '../repositories/product.repository';
import { ProductResponse, ProductsResponse } from '../interfaces/product.interface';

export const getProducts = async (): Promise<ProductsResponse | ErrorResponse> => {
    try {
        return await getAll();
    } catch {
        return new Promise((resolve, reject) => {
            reject(returnError(ValidationErrors.serverError));
        });
    }
}

export const getProductById = async (productId: string): Promise<ProductResponse | ErrorResponse> => {
    try {
        return await getById(productId);
    } catch {
        return new Promise((resolve, reject) => {
            reject(returnError(ValidationErrors.serverError));
        });
    }
}