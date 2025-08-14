import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import { APP_NAME } from '@/core/constants';
import SignInForm from '@/core/features/auth/components/SigninForm';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Sign In — ${APP_NAME}`,
  description: 'Authentication',
};

export default async function SigninPage() {
  return (
    <AnimatedCard>
      <CardTitle>Sign In</CardTitle>
      <SignInForm />

      <div className="auth-form_link">
        <Link href="/signup">Create an account</Link>
      </div>
    </AnimatedCard>
  );
}
