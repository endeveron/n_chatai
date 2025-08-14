import { ObjectId } from 'mongoose';

export enum MessageRole {
  system = 'system',
  human = 'human',
  ai = 'ai',
}

export type MemoryNode = {
  context: string;
  timestamp: number;
};

export type ShortTermMemoryNode = {
  role: MessageRole;
  text: string;
  emotion?: string;
};

export type ShortTermMemory = ShortTermMemoryNode[];

export type ChatTokens = {
  input: number;
  output: number;
  total: number;
};
export type Chat = {
  _id: ObjectId;
  user: ObjectId;
  memory: MemoryNode[];
  // messages: ChatMessage[];
  tokens: ChatTokens;
};

// export type BaseChatMessage = {
//   content: string;
//   role: MessageRole;
//   timestamp: number;
//   emotion?: string;
// };

// export type ChatMessageDoc = BaseChatMessage & {
//   _id: ObjectId;
//   chatId: ObjectId;
// };

// export type ChatMessage = BaseChatMessage & {
//   chatId: string;
// };

// export type TChatData = {
//   title: string;
//   messages: ChatMessage[];
// };

// export type ChatItem = {
//   chatId: string;
//   title: string;
// };

// export type CreateChatArgs = {
//   userId: string;
//   title: string;
//   path: string;
// };

// export type CreateMessageArgs = Pick<ChatMessage, 'content' | 'role'> & {
//   chatId: string;
//   timestamp: number;
//   path?: string;
//   emotion?: string;
// };
