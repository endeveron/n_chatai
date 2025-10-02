import { Metadata } from 'next';

import { APP_NAME } from '@/core/constants';
import SignInClient from '@/core/features/auth/components/SignInClient';

export const metadata: Metadata = {
  title: `Sign In — ${APP_NAME}`,
  description: 'Authentication',
};

export default async function SigninPage() {
  return <SignInClient />;
}
