'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { CopyIcon } from '@/core/components/icons/CopyIcon';
import { TranslateIcon } from '@/core/components/icons/TranslateIcon';
import Loading from '@/core/components/ui/Loading';
import { saveMessageTranslation } from '@/core/features/chat/actions/chat';
import Avatar from '@/core/features/chat/components/Avatar';
import { BaseChatMessage, MessageRole } from '@/core/features/chat/types/chat';
import { AvatarKey } from '@/core/features/chat/types/person';
import { translateText } from '@/core/features/translate/actions';
import { useClipboard } from '@/core/hooks/useClipboard';

export interface ChatMessageProps extends BaseChatMessage {
  avatarKey: AvatarKey;
  avatarBlur: string;
  isPremium: boolean;
  onScroll: () => void;
}

const ChatMessage = ({
  id,
  avatarKey,
  avatarBlur,
  content,
  emotion,
  role,
  translation,
  isPremium,
  onScroll,
}: ChatMessageProps) => {
  const { copy } = useClipboard();

  const [localTranslation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAi = role === MessageRole.ai;
  const isHuman = role === MessageRole.human;

  const handleTranslate = async () => {
    const errMsg = 'Unable to translate message.';
    if (!id || !content) {
      console.error(`ChatMessage: ${errMsg} Invalid arguments.`);
      return;
    }

    setTranslating(true);
    onScroll();
    const res = await translateText({
      text: content,
      sourceLang: 'en',
      targetLang: 'uk',
    });

    if (!res.success) {
      setError(res.error.message ?? 'Unable to translate.');
      return;
    }

    if (res.data) {
      // Update local state
      setTranslation(res.data);
      setTranslating(false);
      onScroll();

      // Save translation in db
      const saveTrRes = await saveMessageTranslation({
        messageId: id,
        translation: res.data,
      });

      if (!saveTrRes.success) {
        console.error(`ChatMessage: ${saveTrRes?.error.message ?? errMsg}`);
      }
    }
  };

  const handleCopy = () => {
    copy(content);
    toast('Message text copied to clipboard');
  };

  const avatar = isAi && (
    <Avatar
      avatarKey={avatarKey}
      avatarBlur={avatarBlur}
      emotion={emotion}
      showEmotion
      isFade={true}
    />
  );

  return (
    <div
      className="chat-message flex"
      data-role={isHuman ? 'human' : isAi ? 'ai' : 'system'}
    >
      {avatar}

      <div className="flex items-center">
        <div className="chat-message_content">
          {/* Toolbar */}
          {isPremium && isAi && content && (
            <div className="chat-message_toolbar">
              {/* Copy button */}
              <div onClick={handleCopy} title="Copy message">
                <CopyIcon className="icon--action" />
              </div>

              {/* Translate button */}
              {!translation && !localTranslation && (
                <div onClick={handleTranslate} title="Translate">
                  <TranslateIcon className="icon--action" />
                </div>
              )}
            </div>
          )}

          {content}

          {/* Translated text, if exists */}
          {isAi && !translating && (translation || localTranslation) ? (
            <div className="chat-message_translation">
              {translation || localTranslation}
            </div>
          ) : null}

          {/* Loading */}
          {isAi && translating ? (
            <div className="mt-4 mb-1">
              <Loading />
            </div>
          ) : null}

          {/* Error */}
          {isAi && error ? (
            <div className="mt-4 mb-1 text-muted">{error}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
