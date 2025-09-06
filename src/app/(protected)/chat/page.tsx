import { redirect } from 'next/navigation';

import Loading from '@/core/components/ui/Loading';
import { SIGNIN_REDIRECT } from '@/core/constants';
import { getUserIdByEmail } from '@/core/features/auth/actions';
import { getPeople } from '@/core/features/chat/actions/person';
import NewChat from '@/core/features/chat/components/NewChat';
import { PersonCardData } from '@/core/features/chat/types/person';
import { auth } from '~/auth';

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user) return redirect(SIGNIN_REDIRECT);

  let userId = session.user.id!;
  const userEmail = session.user.email!;
  const userName = session.user.name;
  let people: PersonCardData[] | null = null;

  // Handle case if the user id provided by google
  if (userId.length !== 24) {
    const res = await getUserIdByEmail(userEmail);
    if (!res?.success || !res.data) {
      throw new Error('Could not retrieve user id.');
    }
    userId = res.data;
  }

  const peopleRes = await getPeople(userId);
  if (!peopleRes?.success || !peopleRes.data) {
    throw new Error('Could not retrieve people data.');
  } else {
    people = peopleRes.data;
  }

  return (
    <main className="relative">
      {people ? (
        <NewChat userId={userId} userName={userName} people={people} />
      ) : (
        <Loading />
      )}
    </main>
  );
}
