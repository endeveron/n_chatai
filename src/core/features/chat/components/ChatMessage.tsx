'use client';

import { toast } from 'sonner';

import Avatar from '@/core/features/chat/components/Avatar';
import { BaseChatMessage, MessageRole } from '@/core/features/chat/types/chat';
import { AvatarKey } from '@/core/features/chat/types/person';
import { useClipboard } from '@/core/hooks/useClipboard';

type ChatMessageProps = BaseChatMessage & {
  avatarKey: AvatarKey;
  avatarBlur: string;
};

const ChatMessage = ({
  avatarKey,
  avatarBlur,
  content,
  emotion,
  role,
}: ChatMessageProps) => {
  const { copy } = useClipboard();

  const isAi = role === MessageRole.ai;
  const isHuman = role === MessageRole.human;

  const handleContextClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the default context menu

    copy(content);
    toast('Message text copied to clipboard');
  };

  const avatar = isAi && (
    <Avatar avatarKey={avatarKey} avatarBlur={avatarBlur} emotion={emotion} />
  );

  return (
    <div
      className="chat-message flex"
      data-role={isHuman ? 'human' : isAi ? 'ai' : 'system'}
    >
      {avatar}
      <div className="flex items-center">
        <p onContextMenu={handleContextClick} className="chat-message_content">
          {content}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
