'use server';

import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { saveChatMessagePairInDB } from '@/core/features/chat/actions/chat';
import { llm } from '@/core/features/chat/lib';
import ChatModel from '@/core/features/chat/models/chat';
import {
  ChatMessageItem,
  ChatTokens,
  MessageRole,
} from '@/core/features/chat/types/chat';
import { PersonKey } from '@/core/features/chat/types/person';
import {
  createAltMessageItem,
  extractEmotionFromAIMessageContent,
  normalizeText,
} from '@/core/features/chat/utils/chat';
import {
  configureBaseSystemMessage,
  getAIResHeatIndex,
} from '@/core/features/chat/utils/llm';
import {
  getContextFromVectorStore,
  getMongoVectorStoreForPerson,
  getPersonData,
} from '@/core/features/chat/utils/person';
import { mongoDB } from '@/core/lib/mongo';
import { ServerActionResult } from '@/core/types/common';
import {
  configureCasualServerActionError,
  handleActionError,
} from '@/core/utils/error';

export const askAI = async ({
  chatId,
  chatContext,
  message,
  personKey,
  isChatStart,
  path,
}: {
  chatId: string;
  chatContext: string;
  message: ChatMessageItem;
  personKey: PersonKey;
  isChatStart: boolean;
  path?: string;
}): Promise<
  | ServerActionResult<{
      aiMessage: ChatMessageItem;
      heatIndex?: number;
    }>
  | undefined
> => {
  if (!chatId || !message.content || !personKey) {
    return configureCasualServerActionError(`askAI: Invalid arguments.`);
  }

  try {
    // Retrieve person data either from local map or db.
    const personData = await getPersonData({
      chatId,
      personKey,
    });
    if (!personData) {
      return handleActionError('Unable to retrieve person data', null);
    }

    /**
     * personData:
     *  _id,
        name,
        title,
        status,
        gender,
        bio,
        personKey,
        avatarKey,
        instructions,
        accuracy,
        context: string[] - personality core
     */

    // Connect vector store
    if (!mongoDB.isVectorClientConnected()) {
      await mongoDB.connectVectorClient();
    }

    // Get vector store for the person
    const vectorStore = await getMongoVectorStoreForPerson({
      personKey,
      personContext: personData.context,
    });

    if (!vectorStore) {
      return handleActionError('Unable to retrieve vector store', null);
    }

    const query = message.content;
    // await debugVectorStore(query, vectorStore);

    const personalityContext = await getContextFromVectorStore({
      query,
      personKey,
      vectorStore,
    });
    if (!personalityContext) {
      return handleActionError('Unable to retrieve personality context', null);
    }

    // Configure prompt
    const systemMessage = configureBaseSystemMessage({
      person: {
        accuracy: personData.accuracy,
        name: personData.name,
        instructions: personData.instructions,
      },
      chatContext,
      personalityContext,
      isChatStart,
      isEmojiPermitted: true,
    });

    const humanMessage = new HumanMessage({
      content: [
        {
          type: 'text',
          text: message.content,
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

    // console.log('[Debug] askAI: prompt', prompt);

    const chain = prompt.pipe(llm);
    const aiMsg = await chain.invoke({});

    const content = aiMsg.content.toString();
    const usageMetadata = aiMsg.usage_metadata;

    // Update LLM usage statistics in db
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

    const normalizedContent = normalizeText({
      text: content,
      noLineBreaks: true,
    });

    console.log('[Debug] askAI > AI Response:', normalizedContent);
    const heatIndex = getAIResHeatIndex(aiMsg);
    console.log('[Debug] askAI > heatIndex:', heatIndex);
    console.log('[Debug] askAI > usageMetadata:', usageMetadata);
    console.log('');

    const { aiMsgText, emotion } = extractEmotionFromAIMessageContent(content);

    if (!aiMsgText) {
      // Configure an alternative AI message if LLM doesn't provide content
      return {
        success: true,
        data: {
          aiMessage: createAltMessageItem(),
        },
      };
    }

    // Configure AI message
    const timestamp = new Date().getTime();
    const aiMessage: ChatMessageItem = {
      content: aiMsgText,
      role: MessageRole.ai,
      timestamp,
      emotion,
    };

    // Save both messages in db
    const saveMessagesRes = await saveChatMessagePairInDB({
      chatId,
      humanMessage: message,
      aiMessage,
      path,
    });

    if (saveMessagesRes?.success) {
      return {
        success: saveMessagesRes?.success,
        data: {
          aiMessage,
          heatIndex,
        },
      };
    }

    return {
      success: false,
      error: { message: 'Unable to save message pair in db.' },
    };
  } catch (err: unknown) {
    console.error(`askAI: ${err}`);
    return configureCasualServerActionError(err);
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

    // Try to retrieve chat document from db
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      handleActionError('Unable to retrieve chat document from db', null, true);
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
