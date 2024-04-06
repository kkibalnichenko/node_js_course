export interface User {
    email: string;
    password: string;
}

export interface NewUser extends User {
    role: UserRoles | string;
}

export enum UserRoles {
    admin,
    user,
}

export interface CreateUserResponse {
    data: CreatedUser;
    error: null;
}

export interface CreatedUser {
    id: string;
    email: string;
    password: string;
    role: UserRoles | string;
}

export interface LoginUserResponse {
    data: { token: string };
    error: null;
}