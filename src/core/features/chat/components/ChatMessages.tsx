'use client';

import { useEffect, useRef } from 'react';

import { ScrollArea } from '@/core/components/ui/ScrollArea';
import ChatMessage from '@/core/features/chat/components/ChatMessage';
import Typing from '@/core/features/chat/components/Typing';
import { ChatMessageItem } from '@/core/features/chat/types/chat';
import { AvatarKey } from '@/core/features/chat/types/person';

interface ChatMessagesProps {
  messages: ChatMessageItem[];
  avatarKey: AvatarKey;
  avatarBlur: string;
  isTyping: boolean;
  isPremium: boolean;
}

const ChatMessages = ({
  messages,
  avatarKey,
  avatarBlur,
  isTyping,
  isPremium,
}: ChatMessagesProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll to the last message during translating
  const scrollToBottom = () => {
    // Wait briefly to ensure the component is mounted
    setTimeout(() => {
      if (!ref.current) return;
      ref.current.scrollTo(0, ref.current.scrollHeight);
    }, 100);
  };

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
    <ScrollArea
      className="fade chat-messages chat-container column-stack"
      ref={ref}
    >
      {messages.map((m) => (
        <ChatMessage
          id={m.id}
          key={m.timestamp}
          avatarKey={avatarKey}
          avatarBlur={avatarBlur}
          content={m.content}
          emotion={m.emotion}
          role={m.role}
          translation={m.translation}
          timestamp={m.timestamp}
          onScroll={scrollToBottom}
          isPremium={isPremium}
        />
      ))}
      {typingMessageEl}
    </ScrollArea>
  );
};

export default ChatMessages;
