import { Types } from 'mongoose';
import { Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

import { UserRole } from '@/core/types/user';

export type Invite = {
  code: string;
  userId?: Types.ObjectId;
  timestamp?: number;
};

export interface JwtEmailPayload {
  userId: string;
  exp: number;
}

export interface GlobalAuthState {
  isSigningOut: boolean;
  isSignedOut: boolean;
  lastSignOutTime: number;
  sessionId: string | null;
  signOutCount: number;
}

export interface CustomToken extends JWT {
  userId: string;
  role: UserRole;
  isPremium: boolean;
  accessToken?: string;
  // refreshToken?: string;
  // accessTokenExpires?: number;
  error?: string;
}

// Extended session type with custom properties
export interface ExtendedSession extends Session {
  // accessToken?: string;
  // user: {
  //   id: string;
  //   role: UserRole;
  //   premium: string | null;
  //   name?: string | null;
  //   email?: string | null;
  //   image?: string | null;
  // };
  expires: string;
  // accessTokenExpiry?: number;
  // refreshTokenExpiry?: number;
  iat?: number; // Token issued at time
}

export enum SocialProvider {
  google = 'google',
}

export type Credentials = {
  email: string;
  password: string;
};

export type SignInArgs = Credentials & {
  redirectTo?: string;
};

export type SignInSocialArgs = {
  provider: SocialProvider;
  email: string;
  emailConfirmed: boolean;
  name?: string | null;
  image?: string | null;
};

export type SignUpArgs = {
  email: string;
};

export type OnboardUserArgs = {
  userId: string;
  name?: string;
  password: string;
  inviteCode: string;
};

export type CreateUserArgs = {
  email: string;
};
