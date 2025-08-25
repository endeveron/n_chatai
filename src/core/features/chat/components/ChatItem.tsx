'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { HeartIcon } from '@/core/components/icons/HeartIcon';
import Avatar from '@/core/features/chat/components/Avatar';
import { MAX_HEAT_LEVEL } from '@/core/features/chat/constants';
import { ChatItem as TChatItem } from '@/core/features/chat/types/chat';

type ChatItemProps = TChatItem & {};

const ChatItem = ({ chatId, title, person, heatLevel }: ChatItemProps) => {
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
      <div className="chat-item_avatar relative">
        <Avatar avatarKey={person.avatarKey} avatarBlur={person.avatarBlur} />
        {heatLevel >= MAX_HEAT_LEVEL ? (
          <div className="fade absolute scale-75 -right-2.25 -bottom-0.5 text-accent">
            <HeartIcon />
          </div>
        ) : null}
      </div>
      <div className="flex flex-col ml-4 min-w-0">
        <div className="font-bold truncate">{title || person.name}</div>
        <div className="text-sm text-muted font-medium truncate mt-0.5">
          {person.status}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
