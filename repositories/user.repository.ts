import { compare, hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import jwt, { Secret } from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

import { CreateUserResponse, CreatedUser, NewUser, User, LoginUserResponse } from '../interfaces/user.interface';
import { default as mockUsers } from '../mocks/users.json';
import { writeToFile } from '../utils';
import { ValidationErrors } from '../constants/errors';

const JWT_KEY = process.env.JWT_KEY as Secret;

export const create = ({ email, password, role }: NewUser): Promise<CreateUserResponse> => {
    return hash(password, 10)
        .then(async (hash: string) => {
            const id = uuidv4();
            const user: CreatedUser = {
                id,
                email,
                password: hash,
                role,
            };
            let users: CreatedUser[] = mockUsers ? [...mockUsers, user] : [user];
            writeToFile(path.join(__dirname, '../../mocks/users.json'), users);

            return {
                data: {
                    id,
                    email: user.email,
                    role: user.role,
                },
                error: null
            };
        })
        .catch((err) => {
            return err;
        });
}

export const login = ({ email, password }: User): Promise<LoginUserResponse | string> => {
    const user: NewUser = mockUsers.find(elem => elem.email === email) || {} as NewUser;
    return compare(password, user.password)
        .then(async (result: boolean) => {
            if (!result) {
                return ValidationErrors.userNotExist;
            }

            const token = jwt.sign({ email }, JWT_KEY, {expiresIn: "1h"});
            return {
                data: { token },
                error: null
            };
        })
        .catch((err) => {
            return err;
        });
}