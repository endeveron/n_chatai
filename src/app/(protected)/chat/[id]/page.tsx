import { Types } from 'mongoose';
import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/core/constants';
import { getChat } from '@/core/features/chat/actions/chat';
import ChatClient from '@/core/features/chat/components/ChatClient';
import ChatDetails from '@/core/features/chat/components/ChatDetails';
import { ChatClientData } from '@/core/features/chat/types/chat';
import { auth } from '~/auth';

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return redirect(SIGNIN_REDIRECT);

  const { id: chatId } = await params;
  const userEmail = session.user.email;

  if (!chatId) throw new Error('Unable to get chat id.');
  if (!userEmail) throw new Error('Unable to get user email.');

  // Validate the chat object id
  if (chatId.length === 24) {
    const isChatIdValid = Types.ObjectId.isValid(chatId);
    if (!isChatIdValid) throw new Error('Invalid chat id param.');
  }

  // Fetch chat data
  const res = await getChat({ chatId, userEmail });
  if (!res?.success && res?.error) {
    throw new Error(res.error.message);
  } else if (!res?.success) {
    throw new Error('Unable to retrieve chat data from database.');
  }

  if (!res.data) return null;

  // Configure data
  const chatClientData = { chatId, ...res.data } as ChatClientData;
  const person = res.data.person;

  if (!chatClientData || !person) {
    throw new Error('No chat data.');
  }

  return (
    <main className="relative">
      <ChatClient {...chatClientData} />
      <ChatDetails person={person} />
    </main>
  );
}
