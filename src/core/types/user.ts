import { ObjectId } from 'mongoose';

export enum UserRole {
  user = 'user',
  admin = 'admin',
}

export type User = {
  _id: ObjectId;
  id: string;
  name?: string;
  email: string;
  emailConfirmed?: boolean;
  password?: string;
  role: UserRole;
  image?: string;
  premium?: {
    transactionId: string;
    timestamp?: number;
  };
};

export type TUserData = {
  name: string;
  email: string;
};
