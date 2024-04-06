import { ErrorResponse } from '../interfaces/error.interface';

export const returnError = (errorType: ValidationErrors | string): ErrorResponse => ({
    data: null,
    error: {
        message: errorType
    }
});

export enum ValidationErrors {
    serverError = 'Internal Server error',
    invalidEmail = 'Email is not valid',
    userNotExist = 'No user with such email or password',
    noAuthorizationHeader = 'User is not authorized',
    userIsNotAuthorized = 'You must be authorized user',
    noProductById = 'No product with such id',
    invalidProduct = 'Products are not valid',
    cartNotFound = 'Cart was not found',
    cartIsEmpty = 'Cart is empty',
}