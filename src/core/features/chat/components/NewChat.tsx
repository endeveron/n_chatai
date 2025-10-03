'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { ScrollArea } from '@/core/components/ui/ScrollArea';
import { createChat } from '@/core/features/chat/actions/chat';
import ExplicitContentWarning from '@/core/features/chat/components/ExplicitContentWarning';
import NewChatForm from '@/core/features/chat/components/NewChatForm';
import PeopleList from '@/core/features/chat/components/PeopleList';
import Topbar, { TopbarTitle } from '@/core/features/chat/components/Topbar';
import {
  CreateChatArgs,
  CreateChatData,
} from '@/core/features/chat/types/chat';
import {
  Gender,
  PersonCardData,
  SelectPerson,
} from '@/core/features/chat/types/person';
import { getRandomName } from '@/core/features/chat/utils/chat';
import { useError } from '@/core/hooks/useError';

const personInitValue: SelectPerson = {
  _id: '',
  gender: Gender.female,
};

interface NewChatProps {
  people: PersonCardData[];
  userId: string;
  userName?: string | null;
}

const NewChat = ({ people, userId, userName }: NewChatProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toastError } = useError();

  const [isPending, setPending] = useState(false);
  const [person, setPerson] = useState<SelectPerson>(personInitValue);

  const ref = useRef<HTMLDivElement>(null);

  const personId = person._id;
  const isAvailable = people.length > 0;

  const handleFormSubmit = async (data: CreateChatData) => {
    let personName = data.personName;

    console.log('handleFormSubmit', data);

    // Assign a random AI person name if it hasn't been provided
    if (!personName) {
      personName = getRandomName(person.gender);
    }

    // Configure chat data
    const chatData: CreateChatArgs = {
      userId,
      userName: data.userName,
      personName,
      personId,
      path: pathname,
    };

    if (data?.language) {
      chatData.language = data.language;
    }

    // Create a chat
    try {
      setPending(true);

      console.log('handleFormSubmit chatData', chatData);

      const res = await createChat(chatData);
      if (!res?.success || !res.data) {
        toastError(res);
        return;
      }

      // Navigate to the chat page
      router.push(`/chat/${res.data.chatId}`);
    } catch (err: unknown) {
      toastError(err);
      setPending(false);
    }
  };

  const handleFormCancel = () => {
    setPerson(personInitValue);
    router.back();
  };

  const scrollToBottom = () => {
    // window.scrollTo({
    //   top: document.body.scrollHeight,
    //   behavior: 'smooth',
    // });
    // Wait briefly to ensure the component is mounted
    setTimeout(() => {
      if (!ref.current) return;
      ref.current.scrollTo(0, ref.current.scrollHeight);
    }, 100);
  };

  useEffect(() => {
    if (!personId) return;
    scrollToBottom();
  }, [personId]);

  return (
    <div className="fade new-chat">
      <Topbar>
        {isAvailable ? <TopbarTitle>New Chat</TopbarTitle> : null}
      </Topbar>

      <ScrollArea ref={ref}>
        {isAvailable ? (
          <div className="chat-container py-8 flex flex-col gap-8">
            <ExplicitContentWarning purpose="chat" />
            <div className="border-2 border-muted/20 rounded-xl">
              <h3 className="w-fit ml-2 px-4 pb-1 text-title bg-background -translate-y-1/2">
                Select a Chat Mate
              </h3>
              <PeopleList
                people={people}
                currentPersonId={personId}
                onSelect={setPerson}
              />
            </div>

            <div className="border-2 border-muted/20 rounded-xl">
              <h3 className="w-fit ml-2 px-4 text-title bg-background -translate-y-1/2">
                Start a Chat
              </h3>

              <div className="relative">
                <NewChatForm
                  userName={userName}
                  isPending={isPending}
                  isActive={!!personId}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />

                {!personId ? (
                  <div className="absolute inset-0 flex-center text-sm text-muted/60 pb-10 cursor-default">
                    Please select a chat mate from the list above
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <h3 className="text-title text-center mt-20">
            There are no available chat mates
          </h3>
        )}
      </ScrollArea>
    </div>
  );
};

NewChat.displayName = 'NewChat';

export default NewChat;
