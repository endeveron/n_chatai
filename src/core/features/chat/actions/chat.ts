'use server';

import { ChatPromptTemplate } from '@langchain/core/prompts';
import { Types } from 'mongoose';
import { revalidatePath } from 'next/cache';

import { getUserIdByEmail } from '@/core/features/auth/actions';
import {
  CHAT_MESSAGE_LIFETIME,
  MEMORY_LENGTH_FOR_CLIENT,
  RECENT_MESSAGES_LIMIT,
} from '@/core/features/chat/constants';
import { llm } from '@/core/features/chat/lib';
import ChatModel from '@/core/features/chat/models/chat';
import MessageModel from '@/core/features/chat/models/message';
import PersonModel from '@/core/features/chat/models/person';
import {
  Chat,
  ChatMessageDb,
  ChatMessageItem,
  ChatResponseData,
  CreateChatArgs,
  MemoryMessage,
  MemoryNode,
} from '@/core/features/chat/types/chat';
import { AvatarKey } from '@/core/features/chat/types/person';
import { createSummaryMessage } from '@/core/features/chat/utils/llm';
import { mongoDB } from '@/core/lib/mongo';
import UserModel from '@/core/models/user';
import { ServerActionResult } from '@/core/types/common';
import { handleActionError } from '@/core/utils/error';
import { normalizeText } from '@/core/features/chat/utils/chat';

export const createChat = async ({
  userId,
  title,
  personId,
  personName,
  path,
}: CreateChatArgs): Promise<
  ServerActionResult<{ chatId: string }> | undefined
> => {
  try {
    await mongoDB.connect();

    const chat = await ChatModel.create({
      title,
      user: userId,
      person: personId,
      personName,
      humanName: null,
      messages: [],
      memory: [],
      tokens: {
        input: 0,
        output: 0,
        total: 0,
      },
    });

    // Update cache
    if (path) revalidatePath(path);

    return {
      success: true,
      data: { chatId: chat._id.toString() },
    };
  } catch (err: unknown) {
    return handleActionError('Unable to create a chat', err);
  }
};

export const cleanChat = async ({
  chatId,
  path,
}: {
  chatId: string;
  path?: string;
}): Promise<ServerActionResult | undefined> => {
  try {
    await mongoDB.connect();

    // Remove related messages (mongo documents)
    await MessageModel.deleteMany({ chatId });

    // Update cache
    if (path) revalidatePath(path);

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Could not delete chat messages', err);
  }
};

export const deleteChat = async ({
  chatId,
  path,
}: {
  chatId: string;
  path?: string;
}): Promise<ServerActionResult | undefined> => {
  try {
    await mongoDB.connect();

    // Delete the chat
    const chat = await ChatModel.findByIdAndDelete(chatId);
    if (!chat) {
      return handleActionError(
        'Could not find a chat for the provided id',
        null
      );
    }

    // Delete message docs that belong to the chat
    await MessageModel.deleteMany({ chatId });

    // Update cache
    if (path) revalidatePath(path);

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Could not delete chat', err);
  }
};

export const getUserChats = async ({
  userEmail,
}: {
  userEmail: string;
}): Promise<
  | ServerActionResult<
      {
        chatId: string;
        title: string;
        person: {
          name: string;
          status: string;
          avatarBlur: string;
          avatarKey: AvatarKey;
        };
      }[]
    >
  | undefined
> => {
  try {
    await mongoDB.connect();

    // Find user by email
    const user = await UserModel.findOne({ email: userEmail });
    if (!user) {
      handleActionError(
        `Could not find a user for provided email ${userEmail}`
      );
    }
    const userId = user._id;

    // Find chats, populate person
    const fetchedChats = await ChatModel.find({ user: userId }).populate({
      path: 'person',
      model: PersonModel,
      select: 'status avatarBlur avatarKey',
    });

    // Configure output data
    const chats = fetchedChats.map((c) => ({
      chatId: c._id.toString(),
      title: c.title || c.personName,
      person: {
        name: c.personName,
        status: c.person.status,
        avatarBlur: c.person.avatarBlur,
        avatarKey: c.person.avatarKey,
      },
    }));

    return {
      success: true,
      data: chats,
    };
  } catch (err: unknown) {
    console.error('getUserChats:', err);
    return handleActionError('Could not retrieve user chat list', err);
  }
};

// export const getChat = unstable_cache(
export const getChat = async ({
  chatId,
  userEmail,
}: {
  chatId: Types.ObjectId | string;
  userEmail: string;
}): Promise<ServerActionResult<ChatResponseData | null> | undefined> => {
  try {
    await mongoDB.connect();

    // Get user object id
    const userRes = await getUserIdByEmail(userEmail);
    if (!userRes?.success || !userRes.data) {
      return handleActionError('Could not find the user', null, true);
    }
    const userId = userRes.data;

    // Retrieve chat document from db
    const chat = await ChatModel.findById(chatId).populate({
      path: 'person',
      model: PersonModel,
      select:
        'id title gender avatarKey personKey status bio accuracy avatarBlur imgBlur',
    });

    if (!chat) {
      // Handle the case where the chat was recently deleted
      return {
        success: true,
        data: null,
      };
    }

    if (chat.user.toString() !== userId) {
      return handleActionError(
        'User with te provided email is not allowed to fetch this chat',
        null,
        true
      );
    }

    // Retrieve related message documents from db
    // const messages = await MessageModel.find({ chatId });

    const messages: ChatMessageDb[] = await MessageModel.aggregate([
      { $match: { chatId: new Types.ObjectId(chatId) } },
      { $sort: { timestamp: -1 } }, // Get newest first
      { $limit: RECENT_MESSAGES_LIMIT }, // Limit
      { $sort: { timestamp: 1 } }, // Sort them back oldest → newest
    ]);

    let parsedMessages: ChatMessageItem[] = [];

    if (messages.length) {
      parsedMessages = messages.map((m: ChatMessageDb) => ({
        content: m.content,
        role: m.role,
        emotion: m.emotion,
        timestamp: m.timestamp,
      }));
    }

    // Join the human messages context
    const parsedMemory = chat.memory.length
      ? (chat.memory as MemoryNode[])
          .slice(-1 * MEMORY_LENGTH_FOR_CLIENT)
          .map((m) => ({
            context: m.context,
            timestamp: m.timestamp,
          }))
      : [];

    const person = chat.person;
    const data: ChatResponseData = {
      title: chat.title || chat.personName,
      humanName: chat.humanName,
      person: {
        _id: person._id.toString(),
        title: person.title,
        name: chat.personName,
        gender: person.gender,
        avatarKey: person.avatarKey,
        avatarBlur: person.avatarBlur,
        imgBlur: person.imgBlur,
        personKey: person.personKey,
        status: person.status,
        bio: person.bio,
        accuracy: person.accuracy,
      },
      memory: parsedMemory,
      messages: parsedMessages,
    };

    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    return handleActionError('Could not retrieve chat', err);
  }
};
// ['chat']

export const saveChatMessagePairInDB = async ({
  chatId,
  humanMessage,
  aiMessage,
  path,
}: {
  chatId: string;
  humanMessage: ChatMessageItem;
  aiMessage: ChatMessageItem;
  path?: string;
}): Promise<ServerActionResult | undefined> => {
  const errMsg = 'Unable to save message pair in db.';

  if (!chatId || !humanMessage || !aiMessage) {
    return handleActionError(`${errMsg} Invalid message data`, null);
  }

  try {
    await mongoDB.connect();

    // Find a chat
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return handleActionError(`${errMsg} Unable to find target chat`, null);
    }

    // Compute message expiration time (used by MongoDB TTL to auto-delete)
    const expiresAt = new Date(Date.now() + CHAT_MESSAGE_LIFETIME);

    // Save message pair in db
    const [humanMsgRes, aiMsgRes] = await MessageModel.insertMany([
      { chatId, ...humanMessage, expiresAt },
      { chatId, ...aiMessage, expiresAt },
    ]);

    const success = Boolean(humanMsgRes._id) && Boolean(aiMsgRes._id);
    if (success) {
      // Update cache
      if (path) revalidatePath(path);
      return {
        success: true,
      };
    }

    return {
      success: false,
      error: {
        message: errMsg,
      },
    };
  } catch (err: unknown) {
    console.error('saveChatMessagePairInDB', err);
    return handleActionError(errMsg, err);
  }
};

export const getChatMemory = async ({
  chatId,
  recentMemoriesCount,
}: {
  chatId: string;
  recentMemoriesCount?: number;
}): Promise<ServerActionResult<string> | undefined> => {
  try {
    await mongoDB.connect();

    // Try to retrieve chat document from db
    let chat;
    if (recentMemoriesCount) {
      chat = await ChatModel.findById(chatId, {
        memory: { $slice: -1 * recentMemoriesCount },
      });
    } else {
      chat = await ChatModel.findById(chatId);
    }

    if (!chat) {
      handleActionError('Unable to retrieve chat document from db', null, true);
      return;
    }

    // Add recent memories context, if exists
    let memory = '';
    const recentMemories: MemoryNode[] = chat?.memory;

    if (recentMemories.length) {
      const memoryArr = recentMemories.reduce(
        (acc: string[], cur: MemoryNode) => {
          return [...acc, cur.context];
        },
        []
      );
      memory = memoryArr.join(' ');
    }

    return {
      success: true,
      data: memory,
    };
  } catch (err: unknown) {
    // return configureCasualServerActionError(err);
    return handleActionError(
      'Unable to retrieve chat memory nodes from db',
      err
    );
  }
};

export const saveChatMemory = async ({
  chatId,
  humanName,
  localMemoryMessages,
}: {
  chatId: string;
  humanName: string | null;
  localMemoryMessages: MemoryMessage[];
}): Promise<ServerActionResult<string> | undefined> => {
  try {
    await mongoDB.connect();

    // Retrieve chat document from db
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      handleActionError('Unable to retrieve chat document from db', null, true);
      return;
    }

    const message = createSummaryMessage({
      humanName,
      localMemoryMessages,
    });

    const summaryPrompt = ChatPromptTemplate.fromMessages([message]);

    const chain = summaryPrompt.pipe(llm);
    const aiMsg = await chain.invoke({});

    const content = aiMsg.content.toString();
    const usageMetadata = aiMsg.usage_metadata;

    // Update LLM usage statistics
    if (usageMetadata?.input_tokens && usageMetadata?.output_tokens) {
      chat.tokens.input += usageMetadata.input_tokens;
      chat.tokens.output += usageMetadata.output_tokens;
      chat.tokens.total +=
        usageMetadata.total_tokens ??
        usageMetadata.input_tokens + usageMetadata.output_tokens;
    }
    await chat.save();

    if (!content) {
      return handleActionError(
        `AIMessageChunk does not contain message content`,
        null
      );
    }

    const normalizedContent = normalizeText({
      text: content,
      noBracedWords: true,
      noLineBreaks: true,
      noEmojis: true,
    });

    console.log('\n\n[Debug] saveChatMemory > summary:', normalizedContent);
    console.log('[Debug] saveChatMemory > usageMetadata:', usageMetadata);

    chat.memory.push({
      context: normalizedContent,
      timestamp: Date.now(),
    });
    await chat.save();

    return {
      success: true,
      data: normalizedContent,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to save chat memory in db', err);
  }
};

export const cleanChatMemory = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ServerActionResult<string> | undefined> => {
  try {
    await mongoDB.connect();

    // Try to retrieve chat document from db
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      handleActionError('Unable to retrieve chat document from db', null, true);
      return;
    }

    if (!chat.memory.length) {
      return {
        success: false,
        error: { message: 'No saved memory' },
      };
    }

    // Remove memory nodes
    chat.memory = [];
    await chat.save();

    return {
      success: true,
    };
  } catch (err: unknown) {
    // return configureCasualServerActionError(err);
    return handleActionError('Unable to clean chat memory nodes in db', err);
  }
};

export const saveHumanName = async ({
  chatId,
  humanName,
}: {
  chatId: string;
  humanName: string;
}): Promise<ServerActionResult | undefined> => {
  try {
    await mongoDB.connect();

    // Retrieve chat document from db
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      handleActionError('Unable to retrieve chat document from db', null, true);
      return;
    }

    chat.humanName = humanName;
    await chat.save();

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to save chat memory in db', err);
  }
};

export const getUsageStatistics = async (
  userId: string
): Promise<ServerActionResult<number> | undefined> => {
  try {
    await mongoDB.connect();

    // Retrieve chat document from db
    const userChats = await ChatModel.find<Chat>({ user: userId });
    if (!userChats.length) {
      return {
        success: true,
        data: 0,
      };
    }

    let totalTokens = 0;

    for (const chat of userChats) {
      totalTokens += chat.tokens.total;
    }

    return {
      success: true,
      data: totalTokens,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to retrieve statistics', err);
  }
};
