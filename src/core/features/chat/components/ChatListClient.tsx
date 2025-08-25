'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import Loading from '@/core/components/ui/Loading';
import { ScrollArea } from '@/core/components/ui/ScrollArea';
import ChatItem from '@/core/features/chat/components/ChatItem';
import MainMenu from '@/core/features/chat/components/MainMenu';
import NewChatButton from '@/core/features/chat/components/NewChatButton';
import Topbar, { TopbarContent } from '@/core/features/chat/components/Topbar';
import {
  ChatItem as TChatItem,
  UserData,
} from '@/core/features/chat/types/chat';

interface ChatListClientProps {
  chatItems: TChatItem[] | null;
  userData: UserData;
}
const ChatListClient = ({ chatItems, userData }: ChatListClientProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isChat = useMemo(() => {
    return pathname.includes('chat');
  }, [pathname]);

  const isNewChat = useMemo(() => {
    return pathname === '/chat';
  }, [pathname]);

  const isNoItems = useMemo(() => {
    return chatItems !== null && chatItems?.length === 0;
  }, [chatItems]);

  // Chat page and user has not chats - redirect to new chat
  useEffect(() => {
    if (isNoItems && pathname !== '/chat') {
      router.push('/chat');
      return;
    }
  }, [isNoItems, pathname, router]);

  // New chat page and user has not chats
  if (isNoItems) {
    return <MainMenu userData={userData} className="main-menu--fixed" />;
  }

  return (
    <div
      className="chat-list"
      data-chat={isChat && 'xs'}
      data-new-chat={isNewChat && true}
    >
      <Topbar>
        <MainMenu userData={userData} />
        <TopbarContent>
          <NewChatButton />
        </TopbarContent>
      </Topbar>

      {chatItems ? (
        <ScrollArea className="chat-list_items">
          {chatItems.map((c) => (
            <ChatItem
              chatId={c.chatId}
              title={c.title}
              person={c.person}
              heatLevel={c.heatLevel}
              key={c.chatId}
            />
          ))}
        </ScrollArea>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ChatListClient;
