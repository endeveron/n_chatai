import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import { APP_NAME } from '@/core/constants';
import CardLogo from '@/core/features/auth/components/CardLogo';
import SignInForm from '@/core/features/auth/components/SigninForm';

export const metadata: Metadata = {
  title: `Sign In — ${APP_NAME}`,
  description: 'Authentication',
};

export default async function SigninPage() {
  return (
    <AnimatedCard>
      <CardLogo />
      <CardTitle className="text-title">Sign In</CardTitle>
      <SignInForm />
    </AnimatedCard>
  );
}
