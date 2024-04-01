import { returnError, ValidationErrors } from '../constants/errors';
import { CreateUserResponse, NewUser, User, LoginUserResponse } from '../interfaces/user.interface';
import { create, login } from '../repositories/user.repository';
import { ErrorResponse } from '../interfaces/error.interface';

export const createUser = async (data: NewUser): Promise<CreateUserResponse | ErrorResponse> => {
    try {
        return await create(data);
    } catch {
        return new Promise((resolve, reject) => {
            reject(returnError(ValidationErrors.serverError));
        });
    }
}

export const loginUser = async (data: User): Promise<LoginUserResponse | ErrorResponse> => {
    try {
        const result = await login(data);
        if (typeof result === 'string') {
            throw new Error();
        } else {
            return await login(data) as LoginUserResponse ;
        }
    } catch {
        return new Promise((resolve, reject) => {
            reject(returnError(ValidationErrors.userNotExist));
        });
    }
}