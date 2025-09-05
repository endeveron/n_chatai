import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import { APP_NAME } from '@/core/constants';
import CardLogo from '@/core/features/auth/components/CardLogo';
import SignUpForm from '@/core/features/auth/components/SignupForm';
import ExplicitContentWarning from '@/core/features/chat/components/ExplicitContentWarning';

export const metadata: Metadata = {
  title: `Sign Up — ${APP_NAME}`,
  description: 'Account creation',
};

export default async function SignupPage() {
  return (
    <AnimatedCard>
      <CardLogo />
      <div className="mb-6 -mt-4 sm:-mx-4">
        <ExplicitContentWarning purpose="signup" />
      </div>
      <CardTitle className="text-title">Sign Up</CardTitle>
      <SignUpForm />
    </AnimatedCard>
  );
}
