import emojiRegex from 'emoji-regex';
import { RefObject } from 'react';

import { getChatMemory, saveChatMemory } from '@/core/features/chat/actions';
import { SHORT_TERM_MEMORY_MESSAGES_TO_SEND } from '@/core/features/chat/constants';
import { MessageRole, ShortTermMemory } from '@/core/features/chat/types';
import { MessageContent, MessageContentText } from '@langchain/core/messages';
import { EMOTIONS } from '@/core/features/character/constants';

/**
 * Retrieves chat memory based on the provided chat ID and
 * recent memories count.
 * @returns The memory text or an empty string.
 */
export const recieveChatMemory = async ({
  chatId,
  recentMemoriesCount,
}: {
  chatId: string;
  recentMemoriesCount?: number;
}): Promise<string> => {
  let memory = '';
  const res = await getChatMemory({
    chatId,
    recentMemoriesCount,
  });

  if (res?.success && res.data) {
    memory = res.data;
  }
  return memory;
};

/**
 * Checks if a given text contains any dance-related keywords.
 *
 * @param text - The input text to search for dance-related terms.
 * @returns True if any dance-related keyword is found; otherwise, false.
 */
export const containsDanceKeywords = (text: string): boolean => {
  const danceKeywords: string[] = [
    'dance',
    'dancing',
    'dancer',
    'salsa',
    'tango',
    'hip hop',
    'breakdance',
    'foxtrot',
    'samba',
    'rumba',
    'cha-cha',
    'dancefloor',
    'choreography',
    'choreographer',
  ];

  return danceKeywords.some((keyword: string) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    return regex.test(text);
  });
};

/**
 * Extracts text content from either a string or an array of message parts.
 * @param {MessageContent} content - MessageContent
 * @param {boolean} isNormalizeText - Clean the parsed text by removing
 * emojis, emotions ($happy) and line breaks.
 * @returns The parsed raw text content.
 */
export const parseAIMessageContent = (
  content: MessageContent,
  isNormalizeText?: boolean
) => {
  let rawText = '';

  if (typeof content === 'string') {
    rawText = content.trim();
  } else if (Array.isArray(content)) {
    rawText = content
      .filter((part): part is MessageContentText => part.type === 'text')
      .map((part) => part.text.trim())
      .join(' ')
      .trim();
  }
  return isNormalizeText ? normalizeText(rawText) : rawText;
};

/**
 * Extracts an emotion tag (e.g., $happy) from the end of an AI message.
 * @param content The AI message content, either a string or structured content array.
 * @returns an object { emotion, text }
 */
export const extractEmotionFromAIMessageContent = (
  content: MessageContent
): { aiMsgText: string; emotion: string } => {
  const parsedText = parseAIMessageContent(content);
  if (!parsedText) {
    return { aiMsgText: '', emotion: 'friendly' };
  }

  const match = parsedText.match(/\$(\w+)\s*$/);
  if (match) {
    const emotionTag = match[1];
    if (EMOTIONS.includes(emotionTag)) {
      const aiMsgText = parsedText.slice(0, match.index);
      return { aiMsgText, emotion: emotionTag };
    }
  }

  return { aiMsgText: parsedText, emotion: 'friendly' };
};

/**
 * Removes any words starting with a dollar sign ($) from the input text.
 * @param {string} text - A string that represents the input text.
 * @returns A new string without the words starting with a dollar sign.
 */
export const removeEmotionMarkers = (text: string): string => {
  return text.replace(/\s*\$[^\s]+\b/g, '');
};

/**
 * Removes emojis from a given text string and cleans up extra spaces.
 * @param {string} text - A string that represents the input text.
 * @returns A new string without emojis and without extra spaces.
 */
export const removeEmojis = (text: string): string => {
  const regex = emojiRegex();
  const noEmojis = text.replace(regex, '');
  const cleaned = noEmojis.replace(/\s+/g, ' ').trim();
  return cleaned;
};

/**
 * Cleans the input prompt by removing:
 *  - Emotion markers (words starting with $)
 *  - Emojis
 *  - Line breaks (\n, \r) - optional (replaced with space)
 *  - The very last line break is always removed (replaced with '')
 * @param {string} prompt - The raw input prompt.
 * @param {boolean} removeLineBreaks - If true, replaces all line breaks with spaces.
 * @returns A cleaned-up version of the prompt.
 */
export const normalizeText = (
  prompt: string,
  removeLineBreaks?: boolean
): string => {
  let cleaned = prompt;

  // Remove $emotion words
  cleaned = removeEmotionMarkers(cleaned);

  // Remove emojis
  cleaned = removeEmojis(cleaned);

  // Optionally replace all line breaks with spaces
  if (removeLineBreaks) {
    cleaned = cleaned.replace(/[\r\n]+/g, ' ');
  }

  // Remove aLL trailing line breaks (at end of string only)
  cleaned = cleaned.replace(/[\r\n]+$/g, '');

  // Normalize multiple spaces
  return cleaned.trim().replace(/\s+/g, ' ');
};

/**
 * Retrieves conversation context based on short-term memory
 * messages, with an option to include full history and AI emotions.
 * @returns A string that represents the conversation context.
 */
export const getConversationContext = ({
  shortTermMemory,
  isForDb,
}: {
  shortTermMemory: ShortTermMemory;
  isForDb?: boolean;
}) => {
  if (shortTermMemory.length === 0) {
    return '';
  }

  // Get messages for context
  const messages = isForDb
    ? shortTermMemory
    : shortTermMemory.slice(-1 * SHORT_TERM_MEMORY_MESSAGES_TO_SEND);

  const contextLines: string[] = [];

  messages.forEach((memory) => {
    if (memory.role === MessageRole.human) {
      contextLines.push(`Human: ${memory.text}`);
    } else if (memory.role === MessageRole.ai) {
      // const emotionInfo = memory.emotion ? ` (${memory.emotion})` : '';
      // contextLines.push(`You${emotionInfo}: "${memory.text}"`);
      contextLines.push(`You: ${memory.text}`);
    }
  });

  // Get the last AI emotion for continuity
  const lastAiMessage = shortTermMemory
    .slice()
    .reverse()
    .find((msg) => msg.role === MessageRole.ai && msg.emotion);

  const emotionContext = lastAiMessage?.emotion
    ? ` You're feeling ${lastAiMessage.emotion}.`
    : '';

  return `${contextLines.join(' ')}${emotionContext}`;
};

/**
 * Merges short-term memory nodes to provide conversation context.
 * @returns A string that represents the conversation context.
 */
export const mergeMemoryNodes = ({
  shortTermMemory,
  isForDb,
}: {
  shortTermMemory: ShortTermMemory;
  isForDb?: boolean;
}) => {
  if (shortTermMemory.length === 0) {
    return '';
  }

  // Get messages for context
  const messages = isForDb
    ? shortTermMemory
    : shortTermMemory.slice(-1 * SHORT_TERM_MEMORY_MESSAGES_TO_SEND);

  const contextLines: string[] = [];

  messages.forEach((memory) => {
    if (memory.role === MessageRole.human) {
      contextLines.push(`Human: "${memory.text}"`);
    } else if (memory.role === MessageRole.ai) {
      const emotionInfo = memory.emotion ? ` (${memory.emotion})` : '';
      contextLines.push(`You${emotionInfo}: "${memory.text}"`);
    }
  });

  // Get the last AI emotion for continuity
  const lastAiMessage = shortTermMemory
    .slice()
    .reverse()
    .find((msg) => msg.role === MessageRole.ai && msg.emotion);

  const emotionContext = lastAiMessage?.emotion
    ? ` You're feeling ${lastAiMessage.emotion}.`
    : '';

  return `Conversation context: ${contextLines.join(' ')}${emotionContext}`;
};

export const saveShortTermMemoryToDb = async ({
  shortTermMemoryRef,
}: {
  shortTermMemoryRef: RefObject<ShortTermMemory>;
}) => {
  try {
    const context = getConversationContext({
      shortTermMemory: shortTermMemoryRef.current,
    });
    // Summarize and save to db as MemoryNode
    const res = await saveChatMemory({
      chatId: '689a27dee239c94b7d83ea69',
      context,
    });

    if (!res?.success) {
      console.error('Unable to save chat memory node in db');
      return;
    }

    if (res.success && res.data?.summary) {
      // Reset short-term memory and add the summary as a system message
      shortTermMemoryRef.current = [
        {
          role: MessageRole.human,
          text: `Recent messages summary: ${res.data.summary}`,
        },
      ];
    }
  } catch (err: unknown) {
    console.error(err);
  }
};
