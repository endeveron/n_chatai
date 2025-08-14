import { DefaultSession, DefaultUser } from 'next-auth';
import { UserRole } from '@/core/types/user';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    error?: string;
    user: {
      id: string;
      role: UserRole;
      isPremium: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    isPremium: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: UserRole;
    isPremium: boolean;
    accessToken?: string;
    error?: string;
  }
}
