import { Types } from 'mongoose';

import {
  AvatarKey,
  CollectionMap,
  PersonBaseData,
  PersonChatData,
} from '@/core/features/chat/types/person';
import { Language } from '@/core/features/chat/data/languages';

export type MemoryNode = {
  context: string;
  timestamp: number;
};

export type ChatTokens = {
  input: number;
  output: number;
  total: number;
};

// Chat document in db
export type Chat = {
  _id: Types.ObjectId;
  title: string;
  user: Types.ObjectId;
  humanName: string;
  personName: string;
  person: Types.ObjectId;
  heatLevel: number;
  memory: MemoryNode[];
  tokens: ChatTokens;
  language?: string;
};

export type ChatResponseData = {
  title: string;
  person: PersonChatData<string> & {
    name: string;
  };
  humanName: string;
  heatLevel: number;
  memory: MemoryNode[];
  messages: ChatMessageItem[];
  language?: string;
};

export type ChatData = Pick<
  ChatResponseData,
  'title' | 'humanName' | 'heatLevel' | 'memory' | 'language'
> & {
  person: PersonBaseData & {
    _id: string;
    name: string;
  };
};

export type ChatClientData = ChatData & {
  messages: ChatMessageItem[];
  chatId: string;
  userId: string;
  isPremium: boolean;
};

export type ChatItem = {
  chatId: string;
  title: string;
  heatLevel: number;
  person: {
    name: string;
    status: string;
    avatarBlur: string;
    avatarKey: AvatarKey;
  };
  language?: string;
};

export type BaseChatMessage = {
  content: string;
  role: MessageRole;
  timestamp: number;
  id?: string;
  emotion?: string;
  translation?: string;
};

export type ChatMessageDb = BaseChatMessage & {
  _id: Types.ObjectId;
  chatId: Types.ObjectId;
  expiresAt: Date;
};

export enum MessageRole {
  system = 'system',
  human = 'human',
  ai = 'ai',
}

export type MemoryMessage = {
  role: MessageRole;
  context: string;
  timestamp: number;
};

export type ChatMessage = BaseChatMessage & {
  chatId: string;
};

export type ChatMessageItem = Pick<
  ChatMessage,
  'id' | 'content' | 'role' | 'emotion' | 'translation'
> & {
  timestamp: number;
};

export type CreateMessageArgs = ChatMessageItem & {
  chatId: string;
  path?: string;
};

export type CreateChatData = {
  userName: string;
  personName: string;
  language?: Language;
};

export type CreateChatArgs = CreateChatData & {
  userId: string;
  personId: string;
  path: string;
};

export type UserData = {
  name?: string | null;
  email?: string | null;
};

export interface NamePattern {
  pattern: RegExp;
  priority: number;
  description: string;
}

export type ImageInfo = { index: number; collectionName: keyof CollectionMap };
