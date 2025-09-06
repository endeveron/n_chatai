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
import { HEAT_LEVEL_KEY } from '@/core/features/chat/constants';
import { PersonKey } from '@/core/features/chat/types/person';
import { useError } from '@/core/hooks/useError';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';

interface ChatMenuProps {
  personKey: PersonKey;
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
  personKey,
  isMemories,
  cleanChat,
  onCleaned,
  onEditMemory,
}: ChatMenuProps) => {
  const router = useRouter();
  const { removeItem } = useLocalStorage();
  const { toastError } = useError();

  const handleEditMemory = async () => {
    // Prevent warning: "Blocked aria-hidden on an element because its descendant retained focus. This gives the browser a moment to blur the dropdown’s focus before hiding it."
    setTimeout(() => {
      onEditMemory();
    }, 50);
  };

  const handleCleanChat = async () => {
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
    } catch (err: unknown) {
      console.error(err);
      toastError(err);
    }
  };

  const handleDeleteChat = async () => {
    try {
      const res = await deleteChat({
        chatId: cleanChat.chatId,
        path: cleanChat.path,
      });
      if (!res?.success) {
        toastError(res);
        return;
      }
      // Delete heat level key from the local storage
      removeItem(`${HEAT_LEVEL_KEY}_${personKey}`);

      // Navigate to chat list page
      router.push(DEFAULT_REDIRECT);
    } catch (err: unknown) {
      console.error(`ChatMenu handleDeleteChat ${err}`);
      toastError(err);
    }
  };

  return (
    <div className="chat-menu w-6 h-6">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MenuIcon className="icon--action" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {isMemories && (
            <DropdownMenuItem onClick={handleEditMemory}>
              <HistoryIcon className="icon--menu" />
              Memories
            </DropdownMenuItem>
          )}
          {cleanChat.show && (
            <DropdownMenuItem onClick={handleCleanChat}>
              <CleanIcon className="icon--menu" />
              Clean chat
            </DropdownMenuItem>
          )}
          {isMemories || (cleanChat.show && <DropdownMenuSeparator />)}
          <DropdownMenuItem className="text-error" onClick={handleDeleteChat}>
            <DeleteIcon />
            <span className="font-medium dark:font-bold">Delete chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatMenu;
