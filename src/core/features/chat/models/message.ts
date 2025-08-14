import { Schema, model, models } from 'mongoose';

import { ChatMessageDb, MessageRole } from '@/core/features/chat/types/chat';

const messageSchema = new Schema<ChatMessageDb>({
  chatId: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
  },
  content: { type: String, required: true },
  role: { type: String, enum: MessageRole, default: MessageRole.human },
  emotion: { type: String },
  timestamp: { type: Number, required: true },
  expiresAt: {
    type: Date,
    required: true,
    // TTL index: Automatically delete the document after the date in `expiresAt`
    expires: 0,
  },
});

const MessageModel = models.Message || model('Message', messageSchema);

export default MessageModel;
