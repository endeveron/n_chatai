'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { DeclineIcon } from '@/core/components/icons/DeclineIcon';
import { ScrollArea } from '@/core/components/ui/ScrollArea';
import {
  saveChatMemory,
  updateHeatLevel,
} from '@/core/features/chat/actions/chat';
import { askAI } from '@/core/features/chat/actions/llm';
import ChatBackgroundImage from '@/core/features/chat/components/ChatBackgroundImage';
import ChatInput from '@/core/features/chat/components/ChatInput';
import ChatMedia from '@/core/features/chat/components/ChatMedia';
import ChatMemoryItem from '@/core/features/chat/components/ChatMemoryItem';
import ChatMenu from '@/core/features/chat/components/ChatMenu';
import ChatMessages from '@/core/features/chat/components/ChatMessages';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
} from '@/core/features/chat/components/Drawer';
import HeatHeart from '@/core/features/chat/components/HeatHeart';
import { NavBack } from '@/core/features/chat/components/NavBack';
import Statistics from '@/core/features/chat/components/Statistics';
import Topbar, {
  TopbarContent,
  TopbarTitle,
} from '@/core/features/chat/components/Topbar';
import {
  HEAT_LEVEL_KEY,
  HEAT_LEVEL_UPDATE_INTERVAL,
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
  heatLevel: fetchedHeatLevel,
  memory,
}: ChatClientProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { getItem, setItem, removeItem } = useLocalStorage();

  const [isPending, setPending] = useState(false);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [heatLevel, setHeatLevel] = useState(0);
  const [isEditMemory, setEditMemory] = useState(false);

  const memoryMessagesRef = useRef<MemoryMessage[]>([]);
  const memoryInitRef = useRef(false);
  const prevHeatLevelRef = useRef(0);

  // const handleDev = async () => {
  //   try {
  //     const res = await createInvite();
  //     console.log('res', res);
  //   } catch (err: unknown) {
  //     console.error(err);
  //   }
  // };

  const handleNavBack = () => {
    router.push('/');
  };

  const handleUpHeat = () => {
    setHeatLevel((prev) => prev + 1);
  };

  const handleDownHeat = () => {
    setHeatLevel((prev) => prev - 1);
  };

  const handleInputSubmit = async (input: string) => {
    let updatedMessages: ChatMessageItem[] = [];

    setPending(true);
    try {
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
        humanName,
      });

      // Get answer from AI
      const res = await askAI({
        chatId,
        humanName,
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
        const { aiMessage, heatIndex } = res.data;

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
        setMessages([...updatedMessages, aiMessage]);

        if (typeof heatIndex === 'number') {
          let newHeatLevel;

          if (heatIndex > 0) {
            newHeatLevel = heatLevel + heatIndex;
            // console.log('[Debug] Increase heat level');
          } else if (heatIndex === 0 && heatLevel > 0) {
            // console.log('[Debug] Decrease heat level');
            newHeatLevel = heatLevel - heatIndex;
          }

          if (newHeatLevel && newHeatLevel >= 0) {
            setItem<number>(
              `${HEAT_LEVEL_KEY}_${person.personKey}`,
              newHeatLevel
            );
            setHeatLevel(newHeatLevel);
          }
        }

        // Periodically save chat memory
        // Get recent messages count, except system (they are memories)
        const recentMessages = memoryMessagesRef.current.filter(
          (m) => m.role !== MessageRole.system
        );

        // const rest = MEMORY_DEPTH - recentMessages.length;
        // if (rest > 0) {
        //   console.log(`[Debug] ${rest} messages left until summary.`);
        // }

        if (recentMessages.length >= MEMORY_DEPTH) {
          // console.log('[Debug] Creating memory...');
          let localMemoryMessages: MemoryMessage[] = [];

          // If person's accuracy = 1 => AI didn't provide fictitious facts, there is no any
          // sense to keep the AI messages (the context will duplicate the person's context).
          if (person.accuracy === 1) {
            localMemoryMessages = recentMessages.filter(
              (m) => m.role === MessageRole.human
            );
          } else {
            localMemoryMessages = recentMessages;
          }

          const saveRes = await saveChatMemory({
            chatId,
            humanName,
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
            // console.log('[Debug] Memory created');
          }
          // else {
          //   console.warn('[Debug] Memory not created');
          // }
        }
      }
    } catch (err: unknown) {
      console.error(`ChatClient handleInputSubmit: ${err}`);
      setMessages([...updatedMessages, createErrorMessageItem()]);
    } finally {
      setPending(false);
    }
  };

  const handleCleanChat = () => {
    // Update local state
    setMessages([]);
    // Update memory
    memoryMessagesRef.current = memoryMessagesRef.current.filter(
      (m) => m.role === MessageRole.system
    );
    // Delete heat level key from the local storage
    removeItem(`${HEAT_LEVEL_KEY}_${person.personKey}`);
  };

  const handleEditMemory = () => {
    setEditMemory(true);
  };

  const handleDelChatMemError = (errMessage: string) => {
    toast(errMessage);
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
      const parsedMemory = memory.map((m) => ({
        role: MessageRole.system,
        context: m.context,
        timestamp: m.timestamp,
      }));
      memoryMessagesRef.current = parsedMemory;
      memoryInitRef.current = true;
    }
  }, [memory, person.personKey]);

  // Init heat level
  useEffect(() => {
    // Check heat level from the local storage
    const heatLevelFromLS =
      getItem<number>(`${HEAT_LEVEL_KEY}_${person.personKey}`) ?? 0;

    // Get the greater of the heat level values
    const greaterLevel = Math.max(heatLevelFromLS, fetchedHeatLevel);
    setHeatLevel(greaterLevel);
    prevHeatLevelRef.current = greaterLevel;

    // Update heat level value in local storage
    if (heatLevelFromLS < greaterLevel) {
      setItem<number>(
        `${HEAT_LEVEL_KEY}_${person.personKey}`,
        fetchedHeatLevel
      );
    }
  }, [fetchedHeatLevel, person.personKey, getItem, setItem]);

  // Update heat level at interval
  useEffect(() => {
    const interval = setInterval(async () => {
      if (prevHeatLevelRef.current === heatLevel) {
        return;
      }

      prevHeatLevelRef.current = heatLevel;

      try {
        const res = await updateHeatLevel({
          chatId,
          heatLevel,
        });

        if (res?.success) {
          // console.log('[Debug] Heat level synchronized.');
          setItem<number>(`${HEAT_LEVEL_KEY}_${person.personKey}`, heatLevel);
        } else {
          console.error(res?.error.message ?? 'Unable to update heat level.');
        }
      } catch (err: unknown) {
        console.error(err);
      }
    }, HEAT_LEVEL_UPDATE_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [chatId, heatLevel, person.personKey, setItem]);

  return (
    <section
      className={cn('fade chat opacity-0 trans-o', chatId && 'opacity-100')}
    >
      {chatId ? (
        <>
          <Topbar>
            <NavBack onClick={handleNavBack} className="topbar_navback" />
            <Statistics />
            {/* <Button onClick={handleDev} size="sm" variant="default">
              DEV
            </Button> */}
            <TopbarContent>
              <div onClick={handleUpHeat}>
                <HeatHeart heatLevel={heatLevel} />
              </div>
              <div onClick={handleDownHeat}>
                <TopbarTitle>{title}</TopbarTitle>
              </div>
            </TopbarContent>
            <ChatMenu
              personKey={person.personKey}
              isMemories={memory.length > 0}
              cleanChat={{ show: !!messages.length, chatId, path: pathname }}
              onCleaned={handleCleanChat}
              onEditMemory={handleEditMemory}
            />
          </Topbar>
          <ChatMessages
            messages={messages}
            avatarKey={person.avatarKey}
            avatarBlur={person.avatarBlur}
            isTyping={isPending}
          />
          <ChatMedia heatLevel={heatLevel} avatarKey={person.avatarKey} />
          <ChatInput onSubmit={handleInputSubmit} isPending={isPending} />
          <ChatBackgroundImage
            src={`/images/people/${person.avatarKey}/chat-bg.png`}
            alt={`${person.name} - ${person.title}`}
            isActive={messages.length < 6}
          />
          <Drawer open={isEditMemory} onChange={setEditMemory}>
            <DrawerContent className="h-120">
              <div className="flex items-center justify-between">
                <h3 className="text-title">{person.name}&apos;s memories</h3>
                <DrawerClose>
                  <div className="icon--action m-0.5 scale-75">
                    <DeclineIcon />
                  </div>
                </DrawerClose>
              </div>
              <ScrollArea className="my-4">
                <div className="flex flex-col gap-2">
                  {memory.map((m) => (
                    <ChatMemoryItem
                      {...m}
                      chatId={chatId}
                      onError={handleDelChatMemError}
                      key={m.timestamp}
                    />
                  ))}
                </div>
              </ScrollArea>
            </DrawerContent>
          </Drawer>
        </>
      ) : null}
    </section>
  );
};

export default ChatClient;
