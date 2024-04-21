import { Schema, Model, model } from 'mongoose';

import { CreatedUser } from '../interfaces/user.interface';

export type UserModel = Model<CreatedUser>;
export const UserSchema = new Schema<CreatedUser, UserModel>({
    id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
});

export const UserMongoose: UserModel = model<CreatedUser, UserModel>('UserMongoose', UserSchema, 'users');
