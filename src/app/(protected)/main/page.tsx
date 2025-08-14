import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/core/constants';
import { auth } from '~/auth';
import MainClient from '@/core/components/MainClient';

export default async function MainPage() {
  const session = await auth();

  if (!session?.user) {
    return redirect(SIGNIN_REDIRECT);
  }

  return <MainClient />;
}
