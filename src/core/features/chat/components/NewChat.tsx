'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { createChat } from '@/core/features/chat/actions/chat';
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

type CreateChatProps = {
  userId: string;
  people: PersonCardData[];
};

const NewChat = ({ userId, people }: CreateChatProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toastError } = useError();

  const [isPending, setPending] = useState(false);
  const [person, setPerson] = useState<SelectPerson>(personInitValue);

  const personId = person._id;

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
        title: values.title,
        personId,
        personName,
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

  return (
    <section className="new-chat fade">
      <Topbar>
        <TopbarTitle>New Chat</TopbarTitle>
      </Topbar>

      <h3 className="mt-4 py-4 text-accent">Select an AI personality</h3>
      <PeopleList
        people={people}
        currentPersonId={personId}
        onSelect={setPerson}
      />
      <div className="chat-container column-stack">
        <NewChatForm
          isPending={isPending}
          isActive={!!personId}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </div>
    </section>
  );
};

NewChat.displayName = 'NewChat';

export default NewChat;
