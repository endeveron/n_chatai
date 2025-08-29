'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { AcceptIcon } from '@/core/components/icons/AcceptIcon';
import { DeclineIcon } from '@/core/components/icons/DeclineIcon';
import { DeleteIcon } from '@/core/components/icons/DeleteIcon';
import { MemoryNode } from '@/core/features/chat/types/chat';
import Loading from '@/core/components/ui/Loading';
import { deleteChatMemoryItem } from '@/core/features/chat/actions/chat';

export interface ChatMemoryItemProps extends MemoryNode {
  chatId: string;
  onError: (errMessage: string) => void;
}

const ChatMemoryItem = ({
  chatId,
  context,
  timestamp,
  onError,
}: ChatMemoryItemProps) => {
  const pathname = usePathname();

  const [isPrompt, setIsPrompt] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePrompt = async (accept: boolean) => {
    if (accept) {
      try {
        setLoading(true);

        const res = await deleteChatMemoryItem({
          chatId,
          timestamp,
          path: pathname,
        });

        if (!res.success) {
          onError(res.error.message ?? 'Unable to delete memory.');
        }
      } catch (err: unknown) {
        console.error(err);
      } finally {
        setLoading(false);
        setIsPrompt(false);
      }
    } else {
      setIsPrompt(false);
    }
  };

  return (
    <div className="chat-memory-item ">
      {context}

      <div className="chat-memory-item_toolbar">
        {isPrompt ? (
          loading ? (
            <div className="scale-75">
              <Loading />
            </div>
          ) : (
            <>
              <div
                onClick={() => handlePrompt(true)}
                className="icon--action m-0.5 scale-75"
              >
                <AcceptIcon />
              </div>
              <div
                onClick={() => handlePrompt(false)}
                className="icon--action m-0.5 scale-75"
              >
                <DeclineIcon />
              </div>
            </>
          )
        ) : (
          <div
            onClick={() => setIsPrompt(true)}
            className="icon--action scale-75"
          >
            <DeleteIcon />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMemoryItem;
