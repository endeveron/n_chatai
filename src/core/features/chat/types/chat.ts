import { ObjectId } from 'mongoose';

import {
  AvatarKey,
  PersonBaseData,
  PersonChatData,
} from '@/core/features/chat/types/person';

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
  _id: ObjectId;
  title: string;
  user: ObjectId;
  humanName: string | null;
  personName: string;
  person: ObjectId;
  heatLevel: number;
  memory: MemoryNode[];
  tokens: ChatTokens;
};

export type ChatResponseData = {
  title: string;
  person: PersonChatData<string> & {
    name: string;
  };
  humanName: string | null;
  heatLevel: number;
  memory: MemoryNode[];
  messages: ChatMessageItem[];
};

export type ChatData = Pick<
  ChatResponseData,
  'title' | 'humanName' | 'heatLevel' | 'memory'
> & {
  person: PersonBaseData & {
    _id: string;
    name: string;
  };
};

export type ChatClientData = ChatData & {
  messages: ChatMessageItem[];
  chatId: string;
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
  _id: ObjectId;
  chatId: ObjectId;
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

export type CreateChatArgs = {
  userId: string;
  title: string;
  personId: string;
  personName: string;
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
