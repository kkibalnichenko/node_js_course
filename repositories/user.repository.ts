import { compare, hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import jwt, { Secret } from 'jsonwebtoken';
import { HydratedDocument } from 'mongoose';
import * as dotenv from 'dotenv';

import { CreatedUser, CreateUserResponse, LoginUserResponse, NewUser, User } from '../interfaces/user.interface';
import { ValidationErrors } from '../constants/errors';
import { UserMongoose } from '../models/user.model';
import {ProductMongoose} from "../models/product.model";

dotenv.config();

const JWT_KEY = process.env.JWT_KEY as Secret;

export const create = ({ email, password, role }: NewUser): Promise<CreateUserResponse> => {
    return hash(password, 10)
        .then(async (hash: string) => {
            const user: HydratedDocument<CreatedUser> = new UserMongoose({
                id: uuidv4(),
                email,
                password: hash,
                role,
            });
            const createdUser = await user.save();

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
    const user = await getUserByEmail(email) || {} as HydratedDocument<CreatedUser>;
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

export const getAllUsers = async (): Promise<HydratedDocument<CreatedUser>[]> => {
    return await UserMongoose
        .find() || [];
};

export const getUserById = async (id: string): Promise<HydratedDocument<CreatedUser>> => {
    if (!id) {
        throw new Error('Id has not been specified');
    }

    return UserMongoose
        .findOne({ id })
        .select('id email role');
}

export const getUserByEmail = async (email: string): Promise<HydratedDocument<CreatedUser>> => {
    if (!email) {
        throw new Error('Email has not been specified');
    }

    return UserMongoose
        .findOne({ email })
        .select('id email password role');
}

export const deleteUser = async (id: string): Promise<HydratedDocument<CreatedUser>> => {
    if (!id) {
        throw new Error('ID has not been specified');
    }

    return UserMongoose
        .findByIdAndDelete(id)
        .select('id email role');
}