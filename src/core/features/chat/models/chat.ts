import { Schema, model, models } from 'mongoose';

import { Chat, MemoryNode } from '@/core/features/chat/types/chat';

const memorySchema = new Schema<MemoryNode>(
  {
    context: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const chatSchema = new Schema<Chat>({
  title: { type: String },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  humanName: { type: String },
  personName: { type: String, require: true },
  person: {
    type: Schema.Types.ObjectId,
    ref: 'Person',
  },
  heatLevel: { type: Number, require: true },
  memory: [memorySchema],
  tokens: {
    input: { type: Number },
    output: { type: Number },
    total: { type: Number },
  },
});

const ChatModel = models.Chat || model('Chat', chatSchema);

export default ChatModel;
