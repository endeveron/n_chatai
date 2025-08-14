'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  saveChatMemory,
  saveHumanName,
} from '@/core/features/chat/actions/chat';
import { askAI } from '@/core/features/chat/actions/llm';
import AskForName from '@/core/features/chat/components/AskForName';
import ChatInput from '@/core/features/chat/components/ChatInput';
import ChatMenu from '@/core/features/chat/components/ChatMenu';
import ChatMessages from '@/core/features/chat/components/ChatMessages';
import Topbar from '@/core/features/chat/components/Topbar';
import TopbarHeader from '@/core/features/chat/components/TopbarHeader';
import {
  DECLINED_NAMES_KEY,
  MEMORY_DEPTH,
} from '@/core/features/chat/constants';
import {
  ChatData,
  ChatMessageItem,
  MemoryMessage,
  MessageRole,
} from '@/core/features/chat/types/chat';
import {
  configureChatContext,
  createErrorMessageItem,
  extractNameFromInput,
  extractNamesFromMemory,
  removeEmoji,
} from '@/core/features/chat/utils/chat';
import { useLocalStorage } from '@/core/hooks/useLocalStorage';
import { cn } from '@/core/utils';

interface ChatClientProps extends ChatData {
  chatId: string;
  messages: ChatMessageItem[];
}

const ChatClient = ({
  chatId,
  title,
  messages: fetchedMessages,
  person,
  humanName,
  memory,
}: ChatClientProps) => {
  const pathname = usePathname();
  const [
    getDeclinedNamesFromLS,
    setDeclinedNamesInLS,
    removeDeclinedNamesFromLS,
  ] = useLocalStorage();

  const [isPending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [humanNameCandidate, setHumanNameCandidate] = useState<string | null>(
    null
  );

  const memoryMessagesRef = useRef<MemoryMessage[]>([]);
  const humanNameRef = useRef<string | null>(null);
  const memoryInitRef = useRef(false);

  const handleInputSubmit = async (input: string) => {
    let updatedMessages: ChatMessageItem[] = [];

    try {
      setPending(true);

      console.log('\n');

      // Extract human's name
      if (!humanNameRef.current) {
        const name = extractNameFromInput(input);
        if (name) {
          humanNameRef.current = name;
        }
        // console.log(
        //   `[Debug] Probably human name found in the human message`,
        //   name
        // );
      }

      // Configure human message
      const humanMessage = {
        content: input,
        role: MessageRole.human,
        timestamp: new Date().getTime(),
      };

      // Update local messages (optimistic)
      updatedMessages = [...messages, humanMessage];
      setMessages(updatedMessages);

      const chatContext = configureChatContext({
        memoryMessagesRef,
        personAccuracy: person.accuracy,
        humanName: humanName || humanNameRef.current,
      });

      // Get answer from AI
      const res = await askAI({
        chatId,
        chatContext,
        message: humanMessage,
        personKey: person.personKey,
        path: pathname,
        isChatStart: messages.length === 0,
      });
      if (!res?.success) {
        console.error(res?.error.message ?? 'Unable to get answer from AI.');
        setMessages([...updatedMessages, createErrorMessageItem()]);
        return;
      }
      if (res.data) {
        const aiMessage: ChatMessageItem = res.data;

        // Add messages to local context memory
        const updContextMemory = [
          ...memoryMessagesRef.current,
          {
            role: MessageRole.human,
            context: removeEmoji(input),
            timestamp: humanMessage.timestamp,
          },
          {
            role: MessageRole.ai,
            context: removeEmoji(aiMessage.content),
            timestamp: aiMessage.timestamp,
          },
        ];

        memoryMessagesRef.current = updContextMemory;

        console.log('memoryMessages', memoryMessagesRef.current);

        setMessages([...updatedMessages, aiMessage]);

        // Periodically save chat memory
        if (updContextMemory.length >= MEMORY_DEPTH) {
          let localMemoryMessages: MemoryMessage[] = [];

          // If person's accuracy = 1 => AI didn't provide fictitious facts, there is no
          // any sense to keep AI messages. The context will duplicate the person's context.
          if (person.accuracy === 1) {
            localMemoryMessages = updContextMemory.filter(
              (m) => m.role === MessageRole.human
            );
          } else {
            // Remove system messages, they are not related to recent chat messages
            localMemoryMessages = updContextMemory.filter(
              (m) => m.role !== MessageRole.system
            );
          }

          const saveRes = await saveChatMemory({
            chatId,
            humanName: humanName || humanNameRef.current,
            localMemoryMessages,
          });

          if (saveRes?.success && saveRes.data) {
            // Remove all messages from the local memory except system
            memoryMessagesRef.current = memoryMessagesRef.current.filter(
              (m) => m.role === MessageRole.system
            );
            memoryMessagesRef.current.push({
              role: MessageRole.system,
              context: saveRes.data,
              timestamp: Date.now(),
            });
          }
        }
      }
    } catch (err: unknown) {
      console.log(err);
      setMessages([...updatedMessages, createErrorMessageItem()]);
    } finally {
      setPending(false);
    }
  };

  const handleCleanChat = () => {
    setMessages([]);
  };

  const handleAskForNameAccept = async () => {
    if (!humanNameCandidate) return;

    const humanName = humanNameCandidate;
    console.log(`[Debug] Human name accepted. Saving...`);
    humanNameRef.current = humanName;

    setTimeout(() => {
      setHumanNameCandidate(null);
    }, 3500);

    // Save/update human name in db
    const res = await saveHumanName({
      chatId,
      humanName,
    });

    if (res?.success) {
      console.log(`[Debug] Human name saved in db`);
      // Remove declined names array from local storage
      removeDeclinedNamesFromLS(`${DECLINED_NAMES_KEY}_${person.personKey}`);
    }
  };

  const handleAskForNameDecline = () => {
    if (!humanNameCandidate) return;

    // Add declined name to local storage
    const declinedNamesFromLS: string[] | null = getDeclinedNamesFromLS(
      `${DECLINED_NAMES_KEY}_${person.personKey}`
    );
    if (!declinedNamesFromLS) {
      setDeclinedNamesInLS(`${DECLINED_NAMES_KEY}_${person.personKey}`, [
        humanNameCandidate,
      ]);
    } else {
      const declinedNamesSet = new Set<string>(declinedNamesFromLS);
      declinedNamesSet.add(humanNameCandidate);
      setDeclinedNamesInLS(`${DECLINED_NAMES_KEY}_${person.personKey}`, [
        ...declinedNamesSet,
      ]);
    }

    setHumanNameCandidate(null);
  };

  // Init messages
  useEffect(() => {
    if (fetchedMessages.length) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  // Init memory
  useEffect(() => {
    if (memoryInitRef.current) return;

    if (memory.length) {
      console.log(`[Debug] Recieved memories for ${person.personKey}`, memory);
      const parsedMemory = memory.map((m) => ({
        role: MessageRole.system,
        context: m.context,
        timestamp: m.timestamp,
      }));
      memoryMessagesRef.current = parsedMemory;
      memoryInitRef.current = true;
    }
  }, [memory, person.personKey]);

  // Extract human name from the chat memory
  useEffect(() => {
    if (humanNameRef.current) return;

    if (humanName) {
      humanNameRef.current = humanName;
      return;
    }

    if (!memory.length) return;

    const nameCandidates = extractNamesFromMemory({
      memoryMessagesRef,
      personName: person.name,
    });

    if (nameCandidates.length) {
      const nameCandidate = nameCandidates[0];

      // Exit if the name-candidate is saved in the local storage as declined
      const declinedNamesFromLS: string[] | null = getDeclinedNamesFromLS(
        `${DECLINED_NAMES_KEY}_${person.personKey}`
      );
      if (declinedNamesFromLS && declinedNamesFromLS.includes(nameCandidate)) {
        return;
      }

      console.log(
        `[Debug] Probably human name candidates found in the chat memory`,
        nameCandidates
      );
      setHumanNameCandidate(nameCandidate);
    }
  }, [
    getDeclinedNamesFromLS,
    humanName,
    memory,
    person.name,
    person.personKey,
  ]);

  // Disabled - Bad results: ['Hi', 'Alex', 'Tell']
  // // Extract human name from the chat messages
  // useEffect(() => {
  //   if (humanNameRef.current) return;

  //   const nameCandidates = extractNamesFromChatMessages({
  //     messages,
  //     personName: person.name,
  //   });

  //   if (nameCandidates.length) {
  //     console.log(
  //       `[Debug] Probably human name candidates found in the chat messages`,
  //       nameCandidates
  //     );
  //     // humanNameRef.current = nameCandidates[0];
  //   }
  // }, [messages, person.name]);

  return (
    <section
      className={cn(
        'chat opacity-0 transition-opacity',
        chatId && 'opacity-100'
      )}
    >
      {chatId ? (
        <>
          <Topbar>
            <TopbarHeader title={title} navPath="/">
              <ChatMenu
                cleanChat={{ show: !!messages.length, chatId, path: pathname }}
                onCleaned={handleCleanChat}
              />
            </TopbarHeader>
          </Topbar>
          <ChatMessages
            messages={messages}
            avatarKey={person.avatarKey}
            avatarBlur={person.avatarBlur}
            isTyping={isPending}
          />

          <AskForName
            allowToShow={!!humanNameCandidate && !messages.length}
            onAccept={handleAskForNameAccept}
            onDecline={handleAskForNameDecline}
            personData={{
              name: person.name,
              avatarKey: person.avatarKey,
              avatarBlur: person.avatarBlur,
            }}
            probablyName={humanNameCandidate}
          />

          <ChatInput onSubmit={handleInputSubmit} isPending={isPending} />
          <div
            className="chat_bg-image"
            data-empty-chat={messages.length === 0 ? 'true' : 'false'}
          >
            <Image
              src={`/images/people/${person.avatarKey}/chat-bg.png`}
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAMAAAC67D+PAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRF////AAAAVcLTfgAAAAF0Uk5TAEDm2GYAAAAOSURBVHjaYmCgJwAIMAAAbgABHA/EkAAAAABJRU5ErkJggg=="
              width={900}
              height={900}
              alt={`${person.name} - ${person.title}`}
            />
          </div>
        </>
      ) : null}
    </section>
  );
};

export default ChatClient;
