import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/core/constants';
import ChatList from '@/core/features/chat/components/ChatList';
import { auth } from '~/auth';
import Statistics from '@/core/features/chat/components/Statistics';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return redirect(SIGNIN_REDIRECT);

  return (
    <>
      <ChatList />
      <Statistics />

      {/* Chat | NewChat components */}
      {children}
    </>
  );
}
