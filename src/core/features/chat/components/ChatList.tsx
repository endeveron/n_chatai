import { redirect } from 'next/navigation';

import { SIGNIN_REDIRECT } from '@/core/constants';
import { getUserChats } from '@/core/features/chat/actions/chat';
import ChatListClient from '@/core/features/chat/components/ChatListClient';
import { ChatItem } from '@/core/features/chat/types/chat';
import { auth } from '~/auth';

const ChatList = async () => {
  const session = await auth();
  if (!session?.user) return redirect(SIGNIN_REDIRECT);

  const userName = session.user.name!;
  const userEmail = session.user.email!;
  let chatItems: ChatItem[] | null = null;

  // Fetch user's chats
  const res = await getUserChats({ userEmail });
  if (!res?.success) {
    throw new Error(res?.error.message ?? 'Could not fetch user chats.');
  }

  if (res.data) {
    // The `chats` data must be returned to process the redirection to a new chat
    chatItems = res.data;
  }

  const userData = {
    name: userName,
    email: userEmail,
  };

  return <ChatListClient chatItems={chatItems} userData={userData} />;
};

export default ChatList;
