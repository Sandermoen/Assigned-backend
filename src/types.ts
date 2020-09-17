import { Document } from 'mongoose';

export enum Role {
  Teacher = 'teacher',
  Student = 'student',
}

export interface IUser {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Role;
}

export interface IUserDocument extends IUser, Document {}

export type NonSensitiveUser = Omit<IUser, 'password'> & { id: string };

export interface Credentials {
  email: string;
  password: string;
}

export interface IRefreshToken {
  token: string;
  issued: number;
  expiry: number;
  user: NonSensitiveUser;
}

export interface ISignUpResponse {
  body: {
    user: IUser & { id: string };
    accessToken: string;
  };
}
