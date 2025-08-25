'use client';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/DropdownMenu';
import { CleanIcon } from '@/core/components/icons/CleanIcon';
import { DeleteIcon } from '@/core/components/icons/DeleteIcon';
import { MenuIcon } from '@/core/components/icons/MenuIcon';
import { DEFAULT_REDIRECT } from '@/core/constants';
import {
  cleanChat as clean,
  deleteChat,
} from '@/core/features/chat/actions/chat';
import { useError } from '@/core/hooks/useError';

interface ChatMenuProps {
  cleanChat: {
    show: boolean;
    chatId: string;
    path: string;
  };
  onCleaned: () => void;
}

const ChatMenu = ({ cleanChat, onCleaned }: ChatMenuProps) => {
  const router = useRouter();
  const { toastError } = useError();

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
      // Navigate to chat list page
      router.push(DEFAULT_REDIRECT);
    } catch (err: unknown) {
      console.log(err);
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
          {cleanChat.show && (
            <DropdownMenuItem onClick={handleCleanChat}>
              <CleanIcon className="icon--menu" />
              Clean chat
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDeleteChat}>
            <DeleteIcon className="icon--menu" />
            Delete chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatMenu;
