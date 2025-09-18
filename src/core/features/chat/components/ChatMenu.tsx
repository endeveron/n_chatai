'use client';
import { useRouter } from 'next/navigation';

import { CleanIcon } from '@/core/components/icons/CleanIcon';
import { DeleteIcon } from '@/core/components/icons/DeleteIcon';
import { HistoryIcon } from '@/core/components/icons/HistoryIcon';
import { MenuIcon } from '@/core/components/icons/MenuIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/core/components/ui/DropdownMenu';
import { DEFAULT_REDIRECT } from '@/core/constants';
import {
  cleanChat as clean,
  deleteChat,
} from '@/core/features/chat/actions/chat';
import { useError } from '@/core/hooks/useError';
import { useEffect, useRef, useState } from 'react';
import MenuPrompt from '@/core/components/ui/MenuPrompt';

interface ChatMenuProps {
  isMemories: boolean;
  cleanChat: {
    show: boolean;
    chatId: string;
    path: string;
  };
  onCleaned: () => void;
  onEditMemory: () => void;
}

const ChatMenu = ({
  isMemories,
  cleanChat,
  onCleaned,
  onEditMemory,
}: ChatMenuProps) => {
  const router = useRouter();
  const { toastError } = useError();

  const [isOpen, setOpen] = useState(false);
  const [isCleaning, setCleaning] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [prompt, setPrompt] = useState<'clean' | 'delete' | null>(null);

  const memoryTimeout = useRef<NodeJS.Timeout | null>(null);
  const cleanChatTimeout = useRef<NodeJS.Timeout | null>(null);
  const deleteChatTimeout = useRef<NodeJS.Timeout | null>(null);
  const declineTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open && prompt === null) {
      setOpen(false);
    } else {
      setOpen(true);
    }
  };

  const handleEditMemory = async () => {
    if (prompt) return;

    // Prevent warning: "Blocked aria-hidden on an element because its descendant retained focus. This gives the browser a moment to blur the dropdown’s focus before hiding it."
    memoryTimeout.current = setTimeout(() => {
      onEditMemory();
    }, 50);
  };

  const handleDecline = async () => {
    declineTimeout.current = setTimeout(() => {
      setPrompt(null);
    }, 0);
  };

  const handleCleanChat = async () => {
    // setCleaning(true);
    // cleanChatTimeout.current = setTimeout(() => {
    //   setCleaning(false);
    //   setPrompt(null);
    //   setOpen(false);
    // }, 2000);

    setCleaning(true);
    try {
      const res = await clean({
        chatId: cleanChat.chatId,
        path: cleanChat.path,
      });
      if (!res?.success) {
        toastError(res);
        return;
      }
      onCleaned();
      setOpen(false);
    } catch (err: unknown) {
      console.error(err);
      toastError(err);
    } finally {
      setCleaning(false);
      setPrompt(null);
    }
  };

  const handleDeleteChat = async () => {
    setDeleting(true);
    try {
      const res = await deleteChat({
        chatId: cleanChat.chatId,
        path: cleanChat.path,
      });
      if (!res?.success) {
        toastError(res);
        return;
      }
      setOpen(false);
      // Navigate to chat list page
      router.push(DEFAULT_REDIRECT);
    } catch (err: unknown) {
      console.error(`ChatMenu handleDeleteChat ${err}`);
      toastError(err);
    } finally {
      setDeleting(false);
      setPrompt(null);
    }
  };

  useEffect(() => {
    const memoryTimeoutValue = memoryTimeout.current;
    const cleanChatTimeoutValue = cleanChatTimeout.current;
    const deleteChatTimeoutValue = deleteChatTimeout.current;
    const declineTimeoutValue = declineTimeout.current;

    return () => {
      if (memoryTimeoutValue) clearTimeout(memoryTimeoutValue);
      if (cleanChatTimeoutValue) clearTimeout(cleanChatTimeoutValue);
      if (deleteChatTimeoutValue) clearTimeout(deleteChatTimeoutValue);
      if (declineTimeoutValue) clearTimeout(declineTimeoutValue);
    };
  }, []);

  return (
    <div className="chat-menu w-6 h-6">
      <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger>
          <MenuIcon className="icon--action" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-36">
          {isMemories && (
            <DropdownMenuItem onClick={handleEditMemory}>
              <HistoryIcon className="icon--menu" />
              Memories
            </DropdownMenuItem>
          )}
          {cleanChat.show && (
            <DropdownMenuItem onClick={() => setPrompt('clean')}>
              {prompt === 'clean' ? (
                <MenuPrompt
                  loading={isCleaning}
                  onAccept={handleCleanChat}
                  onDecline={handleDecline}
                />
              ) : (
                <>
                  <CleanIcon className="icon--menu" />
                  Clean chat
                </>
              )}
            </DropdownMenuItem>
          )}
          {isMemories || (cleanChat.show && <DropdownMenuSeparator />)}
          <DropdownMenuItem
            className="text-error"
            onClick={() => setPrompt('delete')}
          >
            {prompt === 'delete' ? (
              <MenuPrompt
                loading={isDeleting}
                onAccept={handleDeleteChat}
                onDecline={handleDecline}
              />
            ) : (
              <>
                <DeleteIcon />
                <span className="font-medium dark:font-bold">Delete chat</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatMenu;
