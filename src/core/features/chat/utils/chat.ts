import emojiRegex from 'emoji-regex';
import { RefObject } from 'react';

import {
  ALT_MESSAGES,
  DEFAULT_EMOTION_KEY,
  EMOTION_LIST,
  ERROR_MESSAGES,
  NAMES,
} from '@/core/features/chat/data/conversation';
import {
  artFutureEmotionMap,
  gloriaEmotionMap,
  mangoEmotionMap,
  modelArtistEmotionMap,
  sharedEmotionMap,
} from '@/core/features/chat/data/maps';
import {
  ChatMessageItem,
  MemoryMessage,
  MessageRole,
} from '@/core/features/chat/types/chat';
import {
  EmotionData,
  Gender,
  PersonKey,
} from '@/core/features/chat/types/person';
import { ServerActionError } from '@/core/types/common';
import { getRandom } from '@/core/utils';
import { MessageContent, MessageContentText } from '@langchain/core/messages';

/**
 * Returns a random name based on the specified gender.
 * @param {Gender} gender - An optional parameter with a default value of `Gender.female`.
 * @returns A random name from the list of names based on the specified gender.
 */
export const getRandomName = (gender: Gender = Gender.female) => {
  const list = NAMES[gender as keyof typeof NAMES];
  return list[Math.floor(Math.random() * list.length)];
};

/**
 * Generates a message item with random content, AI role, current
 * timestamp, and emotion set to 'doubt'.
 * @returns An alternative message item object of type ChatMessageItem.
 */
/**
 * Generates a chat message item with a random content, AI role,
 * timestamp, and emotion based on a person's key or defaulting to 'doubt'.
 * @param {PersonKey} [personKey] - An optional parameter of type
 * `PersonKey`.
 * @returns a `ChatMessageItem` object
 */
export const createAltMessageItem = (
  personKey?: PersonKey
): ChatMessageItem => {
  let emotion;

  if (personKey) {
    emotion = getPersonalEmotion({
      emotionKey: 'error',
      personKey,
    });
  } else {
    emotion = 'doubt';
  }

  return {
    content: getRandom(ALT_MESSAGES, 22),
    role: MessageRole.ai,
    timestamp: new Date().getTime(),
    emotion,
  };
};

/**
 * Generates a chat message item with a random error message and
 * emotion, optionally personalized for a specific person.
 * @param {PersonKey} [personKey] - An optional parameter that represents
 * a key associated with a person.
 * @returns a `ChatMessageItem` object.
 */
export const createErrorMessageItem = (
  personKey?: PersonKey
): ChatMessageItem => {
  const randomErrMsg = getRandom(ERROR_MESSAGES, 14);
  let emotion;

  if (personKey) {
    emotion = getPersonalEmotion({
      emotionKey: 'error',
      personKey,
    });
  } else {
    emotion = getRandom(['doubt', 'upset'], 2);
  }

  const errorMessage = {
    content: randomErrMsg,
    role: MessageRole.ai,
    timestamp: new Date().getTime(),
    emotion,
  };
  return errorMessage;
};

/**
 * Extracts text content from either a string or an array of message parts.
 * @param {MessageContent} content - MessageContent
 * @param {boolean} isNormalizeText - Clean the parsed text by removing
 * emojis, emotions ($friendly) and line breaks.
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
  return isNormalizeText
    ? normalizeText({ text: rawText, noLineBreaks: true })
    : rawText;
};

export const getPersonalEmotion = ({
  emotionKey,
  personKey,
}: {
  emotionKey: string;
  personKey: PersonKey;
}) => {
  let emotionData: EmotionData;

  // console.log(
  //   `[Debug] getPersonalEmotion:, emotionKey: ${emotionKey}, personKey: ${personKey}`
  // );

  switch (personKey) {
    case PersonKey.artFuture:
      {
        emotionData = artFutureEmotionMap.get(emotionKey) as EmotionData;
      }
      break;
    case PersonKey.gloria:
      {
        emotionData = gloriaEmotionMap.get(emotionKey) as EmotionData;
      }
      break;
    case PersonKey.mango:
      {
        emotionData = mangoEmotionMap.get(emotionKey) as EmotionData;
      }
      break;
    case PersonKey.modelArtist:
      {
        emotionData = modelArtistEmotionMap.get(emotionKey) as EmotionData;
      }
      break;
    default: {
      emotionData = sharedEmotionMap.get(emotionKey) as EmotionData;
    }
  }

  if (!emotionData) {
    // console.warn(
    //   `[Debug] getPersonalEmotion: Unable to get an emotion for ${emotionKey} key.`
    // );
    const defaultData = sharedEmotionMap.get(DEFAULT_EMOTION_KEY)!;
    return getRandom(defaultData.list, defaultData.length);
  }

  return getRandom(emotionData.list, emotionData.length);
};

export const getHeatEmotionKey = (heatIndex: number): string => {
  switch (heatIndex) {
    case 1:
      return 'flirty';
    case 2:
      return 'aroused';
    default:
      return heatIndex > 2 ? 'obsessed' : DEFAULT_EMOTION_KEY;
  }
};

/**
 * Extracts an emotion tag ( e.g., {friendly} ) from the end of an AI message.
 * @param content The AI message content, either a string or structured content array.
 * @returns an object { emotion, text }
 */
export const extractEmotionFromAIMessageContent = ({
  content,
  heatIndex,
  personKey,
}: {
  content: MessageContent;
  heatIndex: number;
  personKey: PersonKey;
}): { aiMsgText: string; emotion: string } => {
  const parsedText = parseAIMessageContent(content);
  if (!parsedText) {
    return { aiMsgText: '', emotion: DEFAULT_EMOTION_KEY };
  }

  const match = parsedText.match(/\{(\w+)\}\s*$/); // extracts {emotion}
  if (match) {
    const initialEmotionKey = match[1];
    const aiMsgText = parsedText.slice(0, match.index).trimEnd();

    let emotionKey = EMOTION_LIST.includes(initialEmotionKey)
      ? initialEmotionKey
      : DEFAULT_EMOTION_KEY;

    if (heatIndex > 0) {
      emotionKey = getHeatEmotionKey(heatIndex);
    }

    const emotion = getPersonalEmotion({
      emotionKey,
      personKey,
    });

    // console.group('[Debug] Extract emotion');
    // console.log('initialEmotionKey:', initialEmotionKey);
    // console.log('emotionKey:', emotionKey);
    // console.log('emotion:', emotion);
    // console.groupEnd();

    return {
      aiMsgText,
      emotion,
    };
  }

  return {
    aiMsgText: parsedText,
    emotion: getPersonalEmotion({
      emotionKey: DEFAULT_EMOTION_KEY,
      personKey,
    }),
  };
};

export /**
 * Removes any words starting with a dollar sign ($) from the input text.
 * @param {string} text - A string that represents the input text.
 * @returns A new string without the words starting with a dollar sign.
 */
const removeEmotionMarkers = (text: string): string => {
  return text.replace(/\s*\$[^\s]+\b/g, '');
};

/**
 * Removes emojis from a given text string and cleans up extra spaces.
 * @param {string} text - A string that represents the input text.
 * @returns A new string without emojis and without extra spaces.
 */
export const removeEmoji = (text: string): string => {
  const regex = emojiRegex();
  const noEmojis = text.replace(regex, '');
  const cleaned = noEmojis.replace(/\s+/g, ' ').trim();
  return cleaned;
};

/**
 * Removes all words or phrases wrapped in curly braces like `{friendly}`, `{excited}`, etc. from the input text.
 * @param text - The input string that may contain `{...}` annotations.
 * @returns A cleaned string.
 */
export const removeBracedWords = (text: string): string => {
  return text.replace(/\s*\{[^}]+\}/g, '');
};

/**
 * Cleans the input prompt by removing:
 *  - Emotion markers (words starting with $)
 *  - Emojis
 *  - Line breaks (\n, \r) - optional (replaced with space)
 *  - The very last line break is always removed (replaced with '')
 * @param {string} prompt - The raw input prompt.
 * @param {boolean} noEmojis - If true, replaces all emojis with spaces.
 * @param {boolean} noBracedWords - If true, replaces all `{friendly}`, `{excited}`, etc. with spaces.
 * @param {boolean} noLineBreaks - If true, replaces all line breaks with spaces.
 * @returns A cleaned-up version of the prompt.
 */
export const normalizeText = ({
  text,
  noBracedWords,
  noEmojis,
  noLineBreaks,
}: {
  text: string;
  noBracedWords?: boolean;
  noEmojis?: boolean;
  noLineBreaks?: boolean;
}): string => {
  let cleaned = text;

  // Remove $emotion words
  cleaned = removeEmotionMarkers(cleaned);

  // Optionally remove items like ` {friendly}` including any preceding space
  if (noBracedWords) {
    cleaned = removeBracedWords(cleaned);
  }

  // Optionally remove emojis
  if (noEmojis) {
    cleaned = removeEmoji(cleaned);
  }

  // Optionally replace all line breaks with spaces
  if (noLineBreaks) {
    cleaned = cleaned.replace(/[\r\n]+/g, ' ');
  }

  // Remove aLL trailing line breaks (at end of string only)
  cleaned = cleaned.replace(/[\r\n]+$/g, '');

  // Normalize multiple spaces
  return cleaned.trim().replace(/\s+/g, ' ');
};

export const configureChatContext = ({
  memoryMessagesRef,
  personAccuracy,
  humanName,
}: {
  memoryMessagesRef: RefObject<MemoryMessage[]>;
  personAccuracy: number;
  humanName: string | null;
}): string => {
  const messages = memoryMessagesRef.current;
  if (!messages.length) return '';

  const isAIAllowedToLie = personAccuracy !== 1;

  // Filter human messages
  const humanMessages = messages.filter((m) => m.role === MessageRole.human);
  const aiMessages = messages.filter((m) => m.role === MessageRole.ai);

  // If AI is not allowed to provide fictitious facts, the context of
  // AI messages in the chat will be the same as in db, nothing to save.
  if (!humanMessages.length && !isAIAllowedToLie) return '';

  const isMessages = humanMessages.length && aiMessages.length;

  const systemMessages: MemoryMessage[] = [];

  let chatContext = isMessages ? '\n\n[Recent messages]\n' : '';
  const name = humanName ?? 'human';

  if (isAIAllowedToLie) {
    // Keep both, human and AI messages, separate system
    messages.forEach((m) => {
      if (m.role === MessageRole.system) {
        systemMessages.push(m);
      }
      if (m.role === MessageRole.human) {
        chatContext += `${name}: ${m.context}\n`;
      }
      if (m.role === MessageRole.ai) {
        chatContext += `you: ${m.context}\n`;
      }
    });
  } else {
    // Keep only human messages, separate system
    messages.forEach((m) => {
      if (m.role === MessageRole.system) {
        systemMessages.push(m);
      }
      if (m.role === MessageRole.human) {
        chatContext += `${name}: ${m.context}\n`;
      }
    });
  }

  // Stringify the last two items of previous context
  const prevSummary = systemMessages.length
    ? systemMessages
        .slice(-2)
        .map((m) => m.context)
        .join('')
    : null;

  const chatSummary = prevSummary ? `\n[Your memories]\n${prevSummary}` : '';

  return `\n\n[CHAT HISTORY]${chatSummary}${chatContext}`;
};

/**
 * Generates a casual error message for user engagement when handling server action errors.
 * @param {unknown} [err] - If an error is provided, it will be logged to the console using
 * `console.error(err).
 * @returns a `ServerActionError` object with the properties `success` set to `false` and
 * `error` set to an object with a `message` property containing a random error message.
 */
export const configureCasualServerActionError = (
  err?: unknown
): ServerActionError => {
  if (err) console.error(err);

  // Use a casual error message to improve user engagement
  const randomErrMsg = getRandom(ERROR_MESSAGES, 14);

  return {
    success: false,
    error: { message: randomErrMsg },
  };
};

// /**
//  * Generates a casual error message for user engagement.
//  * @param {unknown} [err] - If an error is provided, it will be logged to the console using
//  * `console.error(err).
//  * @returns a random casual error message.
//  */
// export const getCasualErrorMessage = (err?: unknown): string => {
//   if (err) console.error(err);

//   // Use a casual error message to improve user engagement
//   const randomErrMsg = getRandom(ERROR_MESSAGES, 14);
//   return randomErrMsg;
// };
