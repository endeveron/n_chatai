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
  configureCasualServerActionError,
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
import { ServerActionResult } from '@/core/types';
import { handleActionError } from '@/core/utils/error';
import { AI_RESPONSE_WAITING_TIME_SEC } from '@/core/features/chat/constants';
import { runWithTimeoutAsync } from '@/core/utils';

export const askAI = async ({
  chatId,
  chatContext,
  humanName,
  message,
  personKey,
  isChatStart,
  language,
  path,
}: {
  chatId: string;
  humanName: string;
  chatContext: string;
  message: ChatMessageItem;
  personKey: PersonKey;
  isChatStart: boolean;
  language?: string;
  path?: string;
}): Promise<
  ServerActionResult<{
    aiMessage: ChatMessageItem;
    heatIndex?: number;
  }>
> => {
  if (!chatId || !message.content || !personKey) {
    return configureCasualServerActionError(`askAI: Invalid arguments.`);
  }

  const mainLogic = async (): Promise<
    ServerActionResult<{
      aiMessage: ChatMessageItem;
      heatIndex?: number;
    }>
  > => {
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
      return handleActionError('Unable to retrieve vector store');
    }

    const query = message.content;

    const personalityContext = await getContextFromVectorStore({
      query,
      personKey,
      vectorStore,
    });
    if (!personalityContext) {
      return handleActionError('Unable to retrieve personality context');
    }

    // Configure prompt
    const systemMessage = configureBaseSystemMessage({
      person: {
        accuracy: personData.accuracy,
        name: personData.name,
        instructions: personData.instructions,
      },
      humanName,
      chatContext,
      personalityContext: '',
      isChatStart,
      isEmojiPermitted: true,
      language,
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

    const heatIndex = getAIResHeatIndex(aiMsg);

    const normalizedContent = normalizeText({
      text: content,
      noLineBreaks: true,
    });

    const { aiMsgText, emotion } = extractEmotionFromAIMessageContent({
      content: normalizedContent,
      heatIndex,
      personKey,
    });

    if (!aiMsgText) {
      // Configure an alternative AI message if LLM doesn't provide content
      return {
        success: true,
        data: {
          aiMessage: createAltMessageItem(personKey),
        },
      };
    }

    //   console.group('[Debug] askAI');
    //   console.log('content:', normalizedContent);
    //   console.log('emotion:', emotion);
    //   console.log('heatIndex:', heatIndex);
    //   console.log('usageMetadata:', usageMetadata);
    //   console.groupEnd();

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
  };

  try {
    return await runWithTimeoutAsync(mainLogic, {
      timeoutMs: AI_RESPONSE_WAITING_TIME_SEC * 1000,
    });
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
}): Promise<ServerActionResult> => {
  try {
    await mongoDB.connect();

    // Try to retrieve chat document from db
    const chat = await ChatModel.findById(chatId);
    if (!chat) {
      return handleActionError('Unable to retrieve chat document from db');
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

// export const testLLM = async (
//   message: string
// ): Promise<ServerActionResult<string>> => {
//   try {
//     const humanMessage = new HumanMessage({
//       content: [
//         {
//           type: 'text',
//           text: message,
//         },
//       ],
//     });

//     const prompt = ChatPromptTemplate.fromMessages([humanMessage]);

//     const chain = prompt.pipe(llm);
//     const aiMsg = await chain.invoke({});

//     const content = aiMsg.content.toString();

//     // const usageMetadata = aiMsg.usage_metadata;
//     // console.log('[Debug] askAI: aiMsg', aiMsg);
//     // console.log('[Debug] askAI: usageMetadata', usageMetadata);

//     return {
//       success: true,
//       data: content,
//     };
//   } catch (err: unknown) {
//     console.error(`testLLM: ${err}`);
//     return configureCasualServerActionError(err);
//   }
// };
