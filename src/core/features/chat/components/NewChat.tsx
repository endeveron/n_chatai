'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { createChat } from '@/core/features/chat/actions/chat';
import ExplicitContentWarning from '@/core/features/chat/components/ExplicitContentWarning';
import NewChatForm from '@/core/features/chat/components/NewChatForm';
import PeopleList from '@/core/features/chat/components/PeopleList';
import Topbar, { TopbarTitle } from '@/core/features/chat/components/Topbar';
import { CreateChatSchema } from '@/core/features/chat/schemas/chat';
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

  const handleFormSubmit = async (values: CreateChatSchema) => {
    let personName = values.personName;
    // Assign a random AI person name if it hasn't been provided
    if (!personName) {
      personName = getRandomName(person.gender);
    }
    // Create chat
    try {
      setPending(true);
      const res = await createChat({
        userId,
        userName: values.userName,
        personName,
        personId,
        path: pathname,
      });
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
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!personId) return;
    scrollToBottom();
  }, [personId]);

  return (
    <section className="new-chat fade">
      <Topbar>
        {isAvailable ? <TopbarTitle>New Chat</TopbarTitle> : null}
      </Topbar>

      {isAvailable ? (
        <div ref={ref} className="py-8 chat-container flex flex-col gap-8">
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
    </section>
  );
};

NewChat.displayName = 'NewChat';

export default NewChat;
