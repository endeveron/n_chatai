import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import { APP_NAME } from '@/core/constants';
import CardLogo from '@/core/features/auth/components/CardLogo';
import SignUpForm from '@/core/features/auth/components/SignupForm';

export const metadata: Metadata = {
  title: `Sign Up — ${APP_NAME}`,
  description: 'Account creation',
};

export default async function SignupPage() {
  return (
    <AnimatedCard>
      <CardLogo />
      <CardTitle className="text-title">Sign Up</CardTitle>
      <SignUpForm />
    </AnimatedCard>
  );
}
