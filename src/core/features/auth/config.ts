import { SIGNIN_REDIRECT, SIGNUP_REDIRECT } from '@/core/constants';
import { NextAuthConfig } from 'next-auth';

export default {
  jwt: {
    maxAge: 5 * 24 * 60 * 60, // 5 days in seconds
  },
  session: {
    strategy: 'jwt', // Required for refresh token logic
    maxAge: 5 * 24 * 60 * 60, // 5 days in seconds
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  pages: {
    signIn: SIGNIN_REDIRECT,
    newUser: SIGNUP_REDIRECT,
  },
  providers: [],
} satisfies NextAuthConfig;

// Session staleness configuration
export const STALENESS_CONFIG = {
  // Refresh if session expires within this time (5 minutes)
  EXPIRY_THRESHOLD: 5 * 60 * 1000,

  // Refresh if session is older than this (30 minutes)
  MAX_AGE: 30 * 60 * 1000,

  // Refresh if user was inactive and session might have changed
  INACTIVITY_THRESHOLD: 10 * 60 * 1000, // 10 minutes

  // Minimum time between forced refreshes
  MIN_REFRESH_INTERVAL: 60 * 1000, // 1 minute
};
