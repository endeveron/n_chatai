'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

import Avatar from '@/core/features/chat/components/Avatar';
import { ChatItem as TChatItem } from '@/core/features/chat/types/chat';

type ChatItemProps = TChatItem & {};

const ChatItem = ({ chatId, title, person }: ChatItemProps) => {
  const router = useRouter();
  const path = usePathname();

  const chatPath = useMemo(() => {
    return `/chat/${chatId}`;
  }, [chatId]);

  const isActive = useMemo(() => {
    return path === chatPath;
  }, [chatPath, path]);

  const openChat = () => {
    router.push(chatPath);
  };
  return (
    <div
      className="chat-item flex items-center"
      data-active={isActive}
      onClick={openChat}
      role="listitem"
    >
      <div className="chat-item_avatar">
        <Avatar avatarKey={person.avatarKey} avatarBlur={person.avatarBlur} />
      </div>
      <div className="flex flex-col ml-4 min-w-0">
        <div className="chat-item_name font-bold truncate">
          {title || person.name}
        </div>
        <div className="chat-item_status text-sm truncate opacity-55 mt-0.5">
          {person.status}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
