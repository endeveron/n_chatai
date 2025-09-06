import { Metadata } from 'next';

import { AnimatedCard, CardTitle } from '@/core/components/ui/Card';
import { APP_NAME } from '@/core/constants';
import CardLogo from '@/core/features/auth/components/CardLogo';
import InviteForm from '@/core/features/auth/components/InviteForm';

export const metadata: Metadata = {
  title: `Invite code — ${APP_NAME}`,
  description: 'Account creation',
};

export default async function InviteCodePage() {
  return (
    <AnimatedCard>
      <CardLogo />
      <CardTitle className="text-title">Invite code</CardTitle>
      <InviteForm />
    </AnimatedCard>
  );
}
