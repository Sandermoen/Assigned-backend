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
