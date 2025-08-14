import { Metadata } from 'next';

import SignUpForm from '@/core/features/auth/components/SignupForm';
import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import { APP_NAME } from '@/core/constants';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Sign Up — ${APP_NAME}`,
  description: 'Account creation',
};

export default async function SignupPage() {
  return (
    <AnimatedCard>
      <CardTitle>Sign Up</CardTitle>
      <SignUpForm />
      <div className="auth-form_link">
        <Link href="/signin">Already have an account ?</Link>
      </div>
    </AnimatedCard>
  );
}
