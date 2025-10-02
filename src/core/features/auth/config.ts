import { NextAuthConfig } from 'next-auth';
import { SIGNIN_REDIRECT, SIGNUP_REDIRECT } from '@/core/constants';

const maxAge = 5 * 24 * 60 * 60; // 5 days in seconds

export default {
  jwt: {
    maxAge,
  },
  pages: {
    signIn: SIGNIN_REDIRECT,
    newUser: SIGNUP_REDIRECT,
  },
  providers: [],
  session: {
    strategy: 'jwt', // Required for refresh token logic
    maxAge,
  },
} satisfies NextAuthConfig;
