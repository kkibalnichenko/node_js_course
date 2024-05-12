import { compare, hash } from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import * as dotenv from 'dotenv';

import { CreateUserResponse, LoginUserResponse, NewUser, User } from '../interfaces/user.interface';
import { ValidationErrors } from '../constants/errors';
import { UserEntity } from '../entity/user.entity';
import { AppDataSource } from '../data-source';

dotenv.config();

const JWT_KEY = process.env.JWT_KEY as Secret;

export const create = ({ email, password, role }: NewUser): Promise<CreateUserResponse> => {
    return hash(password, 10)
        .then(async (hash: string) => {
            const user = new UserEntity();
            user.email = email;
            user.password = hash;
            user.role = role;

            const createdUser = await AppDataSource.getRepository(UserEntity).save(user);

            return {
                data: {
                    id: createdUser.id,
                    email: createdUser.email,
                    role: createdUser.role,
                },
                error: null
            };
        })
        .catch((err) => {
            return err;
        });
}

export const login = async ({ email, password }: User): Promise<LoginUserResponse | string> => {
    const user = await getUserByEmail(email) || {} as UserEntity;
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

export const getAllUsers = async (): Promise<UserEntity[]> => {
    return await AppDataSource.getRepository(UserEntity)
        .find() || [];
};

export const getUserById = async (id: string): Promise<UserEntity | null> => {
    if (!id) {
        throw new Error('Id has not been specified');
    }

    return await AppDataSource.getRepository(UserEntity)
        .findOne({
            select: {
                id: true,
                email: true,
                role: true,
            },
            where: { id }
        });
}

export const getUserByEmail = async (email: string): Promise<UserEntity | null> => {
    if (!email) {
        throw new Error('Email has not been specified');
    }

    return await AppDataSource.getRepository(UserEntity)
        .findOne({
        where: { email }
    });
}