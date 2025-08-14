'use server';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { revalidatePath } from 'next/cache';

import { PROMPT } from '@/core/features/chat/constants';
import { llm } from '@/core/features/chat/lib';
import ChatModel from '@/core/features/chat/models/chat';
import { ChatTokens, MemoryNode } from '@/core/features/chat/types';
import {
  containsDanceKeywords,
  extractEmotionFromAIMessageContent,
  normalizeText,
  parseAIMessageContent,
} from '@/core/features/chat/utils';
import { mongoDB } from '@/core/lib/mongo';
import { ServerActionResult } from '@/core/types/common';
import {
  configureCasualServerActionError,
  handleActionError,
} from '@/core/utils/error';

export const askAI = async ({
  chatId,
  text,
  context,
}: {
  chatId: string;
  text: string;
  context: string;
}): Promise<
  ServerActionResult<{ aiMsgText: string; emotion: string }> | undefined
> => {
  let instructions = PROMPT.baseInstructions;

  if (containsDanceKeywords(text)) {
    instructions += `\nIf you're asked about dancing, use $dancing as emotion and pretend that you can dance a little.`;
  }

  try {
    const systemMessage = new SystemMessage({
      content: `
Instructions: ${instructions}

Inputs:
[CONTEXT]
${context}`,
    });

    const humanMessage = new HumanMessage({
      content: [
        {
          type: 'text',
          text,
        },
        // {
        //   type: "image_url",
        //   image_url: `data:image/png;base64,${image}`,
        // },
      ],
    });

    const prompt = ChatPromptTemplate.fromMessages([
      systemMessage,
      humanMessage,
    ]);

    console.log('askAI prompt', prompt);

    const chain = prompt.pipe(llm);
    const aiMsg = await chain.invoke({});

    console.log('askAI aiMsg', aiMsg);

    const content = aiMsg.content;
    const usageMetadata = aiMsg.usage_metadata;

    if (usageMetadata?.input_tokens && usageMetadata.output_tokens) {
      updateLLMUsageStatistics({
        chatId,
        tokens: {
          input: usageMetadata.input_tokens,
          output: usageMetadata.output_tokens,
          total:
            usageMetadata.total_tokens ??
            usageMetadata.input_tokens + usageMetadata.output_tokens,
        },
      });
    }

    if (!content) {
      return configureCasualServerActionError(
        `AIMessageChunk does not contain message content`
      );
    }

    const data = extractEmotionFromAIMessageContent(content);

    return {
      success: true,
      data,
    };
  } catch (err: unknown) {
    return configureCasualServerActionError(err);
  }
};

export const saveChatMemory = async ({
  chatId,
  context,
}: {
  chatId: string;
  context: string;
}): Promise<ServerActionResult<{ summary: string }> | undefined> => {
  try {
    await mongoDB.connect();

    // Try to recieve chat document from db
    // const chat = await ChatModel.findById(chatId, { memory: { $slice: -4 } });
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      handleActionError('Unable to recieve chat document from db', null, true);
      return;
    }
    const prompt = `
${PROMPT.createSummary}

Inputs:
[CONTEXT]
${context}`;

    const message = new HumanMessage({
      content: [
        {
          type: 'text',
          text: normalizeText(prompt, false),
        },
      ],
    });

    const summaryPrompt = ChatPromptTemplate.fromMessages([message]);

    const chain = summaryPrompt.pipe(llm);
    const aiMsg = await chain.invoke({});

    const content = aiMsg.content;
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
      return configureCasualServerActionError(
        `AIMessageChunk does not contain message content`
      );
    }

    // Create memory, remove emojis, emotions and line breaks
    const summary = parseAIMessageContent(content, true);

    chat.memory.push({
      context: summary,
      timestamp: Date.now(),
    });

    await chat.save();

    return {
      success: true,
      data: {
        summary,
      },
    };
  } catch (err: unknown) {
    return configureCasualServerActionError(err);
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

    // Try to recieve chat document from db
    let chat;
    if (recentMemoriesCount) {
      chat = await ChatModel.findById(chatId, {
        memory: { $slice: -1 * recentMemoriesCount },
      });
    } else {
      chat = await ChatModel.findById(chatId);
    }

    if (!chat) {
      handleActionError('Unable to recieve chat document from db', null, true);
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
    return configureCasualServerActionError(err);
  }
};
export const clearChatMemory = async ({
  chatId,
}: {
  chatId: string;
}): Promise<ServerActionResult<string> | undefined> => {
  try {
    await mongoDB.connect();

    // Try to recieve chat document from db
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      handleActionError('Unable to recieve chat document from db', null, true);
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
    return configureCasualServerActionError(err);
  }
};

export const getChatData = async ({
  userId,
  recentMemoriesCount,
}: {
  userId: string;
  recentMemoriesCount?: number;
}): Promise<
  | ServerActionResult<{
      id: string;
      memory: string;
    }>
  | undefined
> => {
  try {
    await mongoDB.connect();

    // Try to recieve chat document from db
    let chat;
    if (recentMemoriesCount) {
      chat = await ChatModel.findOne(
        { user: userId },
        {
          memory: { $slice: -1 * recentMemoriesCount },
        }
      );
    } else {
      chat = await ChatModel.findOne({ user: userId });
    }

    if (!chat) {
      handleActionError('Unable to recieve chat document from db', null, true);
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
      data: {
        id: chat._id.toString(),
        memory,
      },
    };
  } catch (err: unknown) {
    return handleActionError('Unable to get chat id', err);
  }
};

export const createChat = async ({
  userId,
  path,
}: {
  userId: string;
  path?: string;
}): Promise<ServerActionResult<{ chatId: string }> | undefined> => {
  try {
    await mongoDB.connect();

    // Create a new chat
    const chat = new ChatModel({
      user: userId,
      memory: [],
      tokens: {
        input: 0,
        output: 0,
        total: 0,
      },
    });

    // Save the chat
    await chat.save();

    const chatId = chat._id.toString();

    // Update cache
    if (path) revalidatePath(path);

    return {
      success: true,
      data: { chatId },
    };
  } catch (err: unknown) {
    return handleActionError('Unable to create a chat', err);
  }
};

export const updateLLMUsageStatistics = async ({
  chatId,
  tokens,
}: {
  chatId: string;
  tokens: ChatTokens;
}): Promise<ServerActionResult | undefined> => {
  try {
    await mongoDB.connect();

    // Try to recieve chat document from db
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      handleActionError('Unable to recieve chat document from db', null, true);
      return;
    }

    // Update LLM usage statistics
    chat.tokens.input += tokens.input;
    chat.tokens.output += tokens.output;
    chat.tokens.total += tokens.total;

    await chat.save();

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to update usage statistics', err);
  }
};
