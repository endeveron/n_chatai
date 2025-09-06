import NextAuth, { User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import { authorizeUser, signInSocial } from '@/core/features/auth/actions';
import authConfig from '@/core/features/auth/config';
import { signInSchema } from '@/core/features/auth/schemas';
import { CustomToken, SocialProvider } from '@/core/features/auth/types';
import { UserRole } from '@/core/types/user';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  callbacks: {
    async signIn({ account, profile }) {
      // Handle authentication using Google provider
      if (account && profile && account.provider === 'google') {
        // Check user email
        if (
          !profile.email ||
          !profile.email_verified ||
          !profile.email?.endsWith('@gmail.com')
        ) {
          return false;
        }
        // Add user to the database if it has not been created
        const { email, email_verified, name, picture } = profile;
        const res = await signInSocial({
          provider: SocialProvider.google,
          email,
          emailConfirmed: email_verified,
          name: name,
          image: picture,
        });
        if (!res?.success) return false;
      }
      return true;
    },

    async jwt({ token, user, account }) {
      const customToken = token as CustomToken;

      // console.log('JWT callback > user:', user);
      // console.log('JWT callback > token before:', customToken);

      // Initial sign in
      if (account && user) {
        return {
          ...customToken,
          userId: user?.id,
          role: user?.role || UserRole.user,
          isPremium: user?.isPremium || false,
          accessToken: account.access_token,
          // accessTokenExpires: account.expires_at
          //   ? account.expires_at * 1000
          //   : Date.now() + 24 * 60 * 60 * 1000, // 24 hours default
        };
      }

      // Add user data if not present (this handles subsequent calls)
      if (
        user &&
        (!customToken.userId ||
          !customToken.role ||
          customToken.isPremium === undefined)
      ) {
        customToken.userId = user.id;
        customToken.role = user?.role || UserRole.user;
        customToken.isPremium = user?.isPremium || false;
      }

      return customToken;
    },

    async session({ session, token }) {
      const customToken = token as CustomToken;

      // console.log('Session callback > token:', customToken);
      // console.log('Session callback > session before:', session);

      // Persist the user role
      // https://authjs.dev/guides/basics/role-based-access-control#with-jwt
      if (session.user && customToken.role) {
        session.user.role = customToken.role as UserRole;
      }

      // Persist the user id
      if (session.user && customToken.userId) {
        session.user.id = customToken.userId;
      }

      // Persist the premium data
      if (session.user) {
        session.user.isPremium = customToken.isPremium;
      }

      // Add access token to session for API calls
      if (customToken?.accessToken) {
        session.accessToken = customToken.accessToken;
      }

      // console.log('Session callback > session after:', session);
      return session;
    },
  },

  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = signInSchema.safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const result: User | null = await authorizeUser({ email, password });
          return result;
        }
        return null;
      },
    }),
  ],
  logger: {
    error(error) {
      if (error?.name === 'CredentialsSignin') {
        // Suppress this specific error
        return;
      }

      // Log other errors normally
      console.error('[auth][error]', error);
    },
    warn(error) {
      console.warn('[auth][warn]', error);
    },
    debug(error) {
      console.debug('[auth][debug]', error);
    },
  },
});
