'use client';

import { useEffect, useRef } from 'react';

import { ScrollArea } from '@/core/components/ui/ScrollArea';
import Typing from '@/core/features/chat/components/Typing';
import { ChatMessageItem } from '@/core/features/chat/types/chat';
import { AvatarKey } from '@/core/features/chat/types/person';
import ChatMessage from '@/core/features/chat/components/ChatMessage';

interface ChatMessagesProps {
  messages: ChatMessageItem[];
  avatarKey: AvatarKey;
  avatarBlur: string;
  isTyping: boolean;
}

const ChatMessages = ({
  messages,
  avatarKey,
  avatarBlur,
  isTyping,
}: ChatMessagesProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll to the last message
  useEffect(() => {
    if (!ref.current) return;
    ref.current.scrollTo(0, ref.current.scrollHeight);
  }, [messages]);

  const typingMessageEl = isTyping && (
    <div className="chat-message typing">
      <Typing />
    </div>
  );

  return (
    <ScrollArea className="chat-messages chat-container column-stack" ref={ref}>
      {messages.map((m) => (
        <ChatMessage
          avatarKey={avatarKey}
          avatarBlur={avatarBlur}
          content={m.content}
          emotion={m.emotion}
          role={m.role}
          timestamp={m.timestamp}
          key={m.timestamp}
        />
      ))}
      {typingMessageEl}
    </ScrollArea>
  );
};

export default ChatMessages;
