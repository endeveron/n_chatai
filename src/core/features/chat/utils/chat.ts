import emojiRegex from 'emoji-regex';

import {
  ALT_MESSAGES,
  DEFAULT_EMOTION,
  EMOTION_LIST,
  emotionMap,
  ERROR_MESSAGES,
  NAME_RECOVERY_QUESTIONS,
  NAMES,
} from '@/core/features/chat/constants';
import {
  ChatMessageItem,
  MemoryMessage,
  MessageRole,
  NamePattern,
} from '@/core/features/chat/types/chat';
import { Gender } from '@/core/features/chat/types/person';
import { getRandom } from '@/core/utils';
import { MessageContent, MessageContentText } from '@langchain/core/messages';
import { RefObject } from 'react';

/**
 * Returns a random name based on the specified gender.
 * @param {Gender} gender - An optional parameter with a default value of `Gender.female`.
 * @returns A random name from the list of names based on the specified gender.
 */
export const getRandomName = (gender: Gender = Gender.female) => {
  const list = NAMES[gender];
  return list[Math.floor(Math.random() * list.length)];
};

/**
 * Generates a message item with random content, AI role, current
 * timestamp, and emotion set to 'doubt'.
 * @returns An alternative message item object of type ChatMessageItem.
 */
export const createAltMessageItem = (): ChatMessageItem => ({
  content: getRandom(ALT_MESSAGES, 22),
  role: MessageRole.ai,
  timestamp: new Date().getTime(),
  emotion: 'doubt',
});

/**
 * Generates a random error message item with content, role,
 * timestamp, and emotion.
 * @returns An error message item object of type ChatMessageItem.
 */
export const createErrorMessageItem = (): ChatMessageItem => {
  const randomErrMsg = getRandom(ERROR_MESSAGES, 14);
  const errorMessage = {
    content: randomErrMsg,
    role: MessageRole.ai,
    timestamp: new Date().getTime(),
    emotion: getRandom(['confused', 'doubt', 'upset'], 3),
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

export const getSuitableEmotion = (emotionKey: string) => {
  const emotionData = emotionMap.get(emotionKey);
  if (emotionData) {
    return getRandom(emotionData.list, emotionData.length);
  }
  const defaultData = emotionMap.get(DEFAULT_EMOTION)!;
  return getRandom(defaultData.list, defaultData.length);
};

/**
 * Extracts an emotion tag ( e.g., {friendly} ) from the end of an AI message.
 * @param content The AI message content, either a string or structured content array.
 * @returns an object { emotion, text }
 */
export const extractEmotionFromAIMessageContent = (
  content: MessageContent
): { aiMsgText: string; emotion: string } => {
  const parsedText = parseAIMessageContent(content);
  if (!parsedText) {
    return { aiMsgText: '', emotion: DEFAULT_EMOTION };
  }

  const match = parsedText.match(/\{(\w+)\}\s*$/); // extracts {emotion}
  if (match) {
    const emotionKey = match[1];
    const aiMsgText = parsedText.slice(0, match.index);

    const baseEmotion = EMOTION_LIST.includes(emotionKey)
      ? emotionKey
      : DEFAULT_EMOTION;
    return { aiMsgText, emotion: getSuitableEmotion(baseEmotion) };
  }

  return {
    aiMsgText: parsedText,
    emotion: getSuitableEmotion(DEFAULT_EMOTION),
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
  const humanNameNote = humanName
    ? `\n\nYou're chatting with ${humanName}.`
    : '';

  return `${humanNameNote}\n\n[CHAT HISTORY]${chatSummary}${chatContext}`;
};

export const extractNameFromInput = (text: string): string | null => {
  // Normalize the text
  const normalizedText = text
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[.,!?]+$/, '')
    .trim();

  // Define patterns with priorities (higher number = higher priority)
  const patterns: NamePattern[] = [
    // Highest priority: Direct introductions with proper boundaries
    {
      pattern:
        /\b(?:i am|i'm|i'm|this is|it's|it is)\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s*[,.!?—-]|\s+(?:and|what|how|let|pretty|your|btw|nice|checking|speaking)\b|$)/i,
      priority: 100,
      description: 'Direct introduction with boundaries',
    },

    // High priority: "Name's/The name's" patterns
    {
      pattern:
        /\b(?:the\s+)?name's\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s*[,.!?—-]|\s+(?:and|what|how|let|nice)\b|$)/i,
      priority: 95,
      description: "Name's pattern",
    },

    // High priority: "It's me" patterns
    {
      pattern:
        /\bit(?:'|')s\s+me[\s,—-]*([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s*[!.?—-]|\s+(?:and|what|let)\b|$)/i,
      priority: 90,
      description: "It's me pattern",
    },

    // High priority: Call me patterns
    {
      pattern:
        /\b(?:you can\s+)?(?:just\s+)?call me\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)/i,
      priority: 85,
      description: 'Call me pattern',
    },

    // Medium-high priority: Active greeting
    {
      pattern:
        /\b([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)\s+(?:here|speaking|in the house|at your service)(?:\s*[,.!?]|\s+(?:and|what|how|let)\b|$)/i,
      priority: 80,
      description: 'Active greeting',
    },

    // Special pattern for "Alex is in the chat" type constructions
    {
      pattern: /\b([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)\s+is\s+in\s+the\s+chat/i,
      priority: 75,
      description: 'Name is in chat pattern',
    },

    // Medium priority: "You've got/You're chatting with" patterns
    {
      pattern:
        /\byou'?(?:ve|re)?\s+(?:got|chatting with|now chatting with|talking to)\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s+(?:on|in|at|right)\b|\s*[,.!?]|$)/i,
      priority: 70,
      description: "You've got pattern",
    },

    // Medium priority: Casual introductions
    {
      pattern:
        /\b(?:just\s+)?dropping in[\s,—-]*(?:it's\s+)?([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s*[,.!?]|$)/i,
      priority: 65,
      description: 'Dropping in pattern',
    },

    // Medium priority: "Guess who" patterns
    {
      pattern:
        /\bguess who\??\s*(?:yup|yeah)?[\s,]*([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s*[,.!?]|$)/i,
      priority: 60,
      description: 'Guess who pattern',
    },

    // Medium priority: "That'd be" patterns
    {
      pattern:
        /\bthat'?(?:d|s)\s+be\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s*[,.!?]|\s+(?:at|and|what)\b|$)/i,
      priority: 55,
      description: "That'd be pattern",
    },

    // Medium priority: Possessive patterns (Alex's got you)
    {
      pattern:
        /\b([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)'s\s+(?:got|here|speaking)/i,
      priority: 50,
      description: 'Possessive pattern',
    },

    // Medium priority: "your pal/friend" patterns
    {
      pattern:
        /\b(?:it's\s+)?your\s+(?:pal|friend|buddy)\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s+(?:in|on|at|here)\b|\s*[,.!?]|$)/i,
      priority: 45,
      description: 'Friendly pattern',
    },

    // Medium priority: Descriptive patterns with boundaries
    {
      pattern:
        /\b(?:i go by|they call me|folks call me|everyone knows me as|i'm called)\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)(?:\s*[,.!?]|$)/i,
      priority: 40,
      description: 'Descriptive introduction',
    },

    // Medium priority: "the one and only" - specific handling
    {
      pattern: /\bi'm\s+the one and only\s+([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*)/i,
      priority: 35,
      description: 'One and only pattern',
    },

    // Lower priority: Name at end of sentence
    {
      pattern: /\b([A-Z][a-z]+(?:[-\s][A-Z][a-z]+)*?)\s*[.!]?\s*$/i,
      priority: 20,
      description: 'Name at end',
    },
  ];

  // Helper function to validate if a captured string is likely a name
  const _isValidName = (candidate: string): boolean => {
    if (!candidate) return false;

    candidate = candidate.trim();

    if (candidate.length < 2 || candidate.length > 50) return false;
    if (!/^[A-Z]/.test(candidate)) return false;

    // More comprehensive invalid name detection
    const invalidNames = [
      'me',
      'you',
      'it',
      'that',
      'this',
      'here',
      'there',
      'what',
      'who',
      'when',
      'where',
      'why',
      'how',
      'the',
      'one',
      'and',
      'only',
      'got',
      'service',
      'help',
      'chat',
      'line',
      'speaking',
      'checking',
      'dropping',
      'guess',
      'yup',
      'yeah',
      'need',
      'name',
      'call',
      'pal',
      'friend',
      'buddy',
      'in',
      'with',
      'now',
      'chatting',
      'house',
      'btw',
      'is',
    ];

    if (invalidNames.includes(candidate.toLowerCase())) return false;

    // Pattern-based validation for phrases
    const candidate_lower = candidate.toLowerCase();
    const invalidPatterns = [
      /\b(?:checking in|speaking|is in|in the|the chat|got you|at your|your service)\b/,
      /\b(?:here|there|what|how|let|pretty|nice|good|ready|right|can|do|for|you|today|up|house|chat|line|convo|question)\b/,
    ];

    return !invalidPatterns.some((pattern) => pattern.test(candidate_lower));
  };

  // Try patterns in priority order
  const sortedPatterns = patterns.sort((a, b) => b.priority - a.priority);

  for (const { pattern } of sortedPatterns) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim();
      if (_isValidName(candidate)) {
        return candidate;
      }
    }
  }

  return null;
};

// const testExtractNameFromInput = (): void => {
//   const testCases = [
//     { input: "Hi there — you've got Alex." },
//     { input: "It's me — Alex!" },
//     { input: "Just dropping in — it's Alex." },
//     { input: "Yo, it's Alex — let's talk!" },
//     { input: "What's good? Alex here, ready to chat." },
//     { input: "You've got Alex on the line." },
//     { input: "Hey, it's Alex! What can I do for you today?" },
//     { input: "Alex in the house! What's up?" },
//     { input: "What's happening? Alex here." },
//     { input: "Alex here, what's your story?" },
//     { input: "Just a heads-up — it's Alex!" },
//     { input: "Well, well, well… if it isn't Alex." },
//     { input: "Welcome, this is Alex speaking." },
//     { input: "Catch me, I'm Alex." },
//     { input: "I'm Alex, what's new with you?" },
//     { input: "Greetings! Alex is in the chat." },
//     { input: "Call me Alex, I'm here for you." },
//     { input: "It's Alex! Let's have a convo." },
//     { input: "Hey, this is Alex. Got a question?" },
//     { input: "It's me — Alex!" },
//     { input: "The name's Alex — what's up?" },
//     { input: "You're now chatting with Alex." },
//     { input: "It's your pal Alex in the chat." },
//     { input: "Hi, I'm Alex" },
//     { input: "Hello I am Alex" },
//     { input: "Hey there, this is Alex" },
//     { input: "Alex speaking" },
//     { input: "It's me, Alex" },
//     { input: "You're chatting with Alex" },
//     { input: "Just call me Alex" },
//     { input: "You can just call me Alex" },
//     { input: "Alex here!" },
//     { input: "The name's Alex" },
//     { input: "Name's Alex" },
//     { input: "Hi, it's Alex" },
//     { input: "Hey, I'm Alex" },
//     { input: "Yo, it's Alex!" },
//     { input: "What's up? Alex here." },
//     { input: "You're talking to Alex right now." },
//     { input: "Just dropping in — it's Alex." },
//     { input: "Hi, this is Alex checking in." },
//     { input: "Heya! Alex speaking." },
//     { input: "Alex here, how can I help?" },
//     { input: "Hi there — you've got Alex." },
//     { input: "It's me — Alex!" },
//     { input: "It's me, Alex!" },
//     { input: "Oh hey, I'm Alex btw." },
//     { input: "Name's Alex, nice to meet you." },
//     { input: "I go by Alex." },
//     { input: "You can call me Alex." },
//     { input: "I'm the one and only Alex" },
//     { input: "Guess who? Yup, Alex." },
//     { input: "That'd be Alex, at your service." },
//     { input: "I'm Alex, your chat buddy." },
//     { input: "This is Alex. What's on your mind?" },
//     { input: "Alex here. Let's get started." },
//     { input: "Need help? Alex's got you." },
//     { input: "Yeah, this is Alex speaking." },
//     { input: "The name's Alex — what's up?" },
//     { input: "Hey, Alex." },
//     { input: "You're now chatting with Alex." },
//     { input: "So... I'm Alex." },
//     { input: "I'm Alex. Pretty chill, huh?" },
//     { input: "Here to help — I'm Alex." },
//     { input: "It's your pal Alex in the chat." }
//   ];

//   console.log("Testing extractNameFromInput function:");
//   testCases.forEach(({ input }, index) => {
//     const result = extractNameFromInput(input);
//     const passed = result === "Alex";
//     console.log(`Test ${index + 1}: ${passed ? "✅" : "❌"} "${input}" -> ${result}`);
//   });
// };

const extractNameUtils = {
  // Extract sequences of 1 to 3 capitalized words (e.g., "Anna Marie", "Jean-Luc", "O'Connor")
  // Avoid single-uppercase-letter words like "I" by requiring at least one lowercase letter
  nameLikePattern:
    // /\b([A-Z][a-z]+(?:['-][A-Z][a-z]+)*(?: [A-Z][a-z]+(?:['-][A-Z][a-z]+)*){0,2})\b/g,
    /\b([A-Z][a-z]{2,}(?:['-][A-Z][a-z]+)*(?: [A-Z][a-z]+(?:['-][A-Z][a-z]+)*){0,2})\b/g,

  // Common English words that start sentences and should be excluded
  commonSentenceStarters: new Set([
    'As',
    'At',
    'By',
    'For',
    'From',
    'In',
    'Of',
    'On',
    'To',
    'With',
    'The',
    'This',
    'That',
    'These',
    'Those',
    'My',
    'Our',
    'His',
    'Her',
    'After',
    'Before',
    'During',
    'Since',
    'Until',
    'While',
    'When',
    'Where',
    'How',
    'What',
    'Who',
    'Why',
    'Which',
    'All',
    'Any',
    'Some',
    'Most',
    'Many',
    'Few',
    'Several',
    'Both',
    'Each',
    'Every',
    'Another',
    'Other',
    'First',
    'Last',
    'Next',
    'Previous',
    'New',
    'Old',
    'Good',
    'Bad',
    'Great',
    'Small',
    'Large',
    'Big',
    'Little',
    'Long',
    'Short',
    'High',
    'Low',
    'Fast',
    'Slow',
    'Early',
    'Late',
    'Today',
    'Tomorrow',
    'Yesterday',
  ]),

  // Validates name for this particular case
  isValidName: ({ name, personName }: { name: string; personName: string }) => {
    const trimmed = name.trim();
    if (trimmed === personName) return false;
    if (trimmed === 'I') return false;
    if (trimmed.length === 0) return false;

    // Exclude common sentence starters
    if (extractNameUtils.commonSentenceStarters.has(trimmed)) return false;

    // Exclude very short names (less than 3 characters) unless they're well-known short names
    const knownShortNames = new Set(['Jo', 'Al', 'Ed', 'Bo', 'Vi', 'Lu', 'Mo']);
    if (trimmed.length < 3 && !knownShortNames.has(trimmed)) return false;

    // Each name part must:
    // - Start with uppercase
    // - Be followed by at least 2 lowercase letters (changed from * to {2,})
    // - Optionally include internal apostrophes or hyphens followed by another capitalized segment
    // - Multiple such parts can be space-separated
    const namePart = `[A-Z][a-z]{2,}(?:['-][A-Z][a-z]*)*`;
    const fullRegex = new RegExp(`^${namePart}( ${namePart})*$`);
    return fullRegex.test(trimmed);
  },
};

export const extractNamesFromMemory = ({
  memoryMessagesRef,
  personName,
}: {
  memoryMessagesRef: RefObject<MemoryMessage[]>;
  personName: string;
}): string[] => {
  let memoryStr = '';

  if (!memoryMessagesRef.current.length) {
    return [];
  }

  for (const m of memoryMessagesRef.current) {
    if (m.role === MessageRole.system) {
      memoryStr += ` ${m.context}`;
    }
  }

  const nameCandidates = new Set<string>();
  const matches = memoryStr.matchAll(extractNameUtils.nameLikePattern);

  for (const match of matches) {
    const name = match[1].trim();
    if (
      extractNameUtils.isValidName({
        name,
        personName,
      })
    ) {
      nameCandidates.add(name);
    }
  }

  return Array.from(nameCandidates);
};

// export const extractNamesFromChatMessages = ({
//   messages,
//   personName,
// }: {
//   messages: ChatMessageItem[];
//   personName: string;
// }): string[] => {
//   let source = '';

//   if (!messages.length) {
//     return [];
//   }

//   for (const m of messages) {
//     if (m.role === MessageRole.human) {
//       source += ` ${m.content}`;
//     }
//   }

//   const nameCandidates = new Set<string>();
//   const matches = source.matchAll(extractNameUtils.nameLikePattern);

//   for (const match of matches) {
//     const name = match[1].trim();
//     if (
//       extractNameUtils.isValidName({
//         name,
//         personName,
//       })
//     ) {
//       nameCandidates.add(name);
//     }
//   }

//   return Array.from(nameCandidates);
// };

export const generateNameRecoveryQuestion = (probablyName: string): string => {
  const phrase = getRandom(NAME_RECOVERY_QUESTIONS, 15);
  return phrase.replace(/\{name\}/g, probablyName);
};
