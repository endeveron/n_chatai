import { Schema, model, models } from 'mongoose';

import { Invite } from '@/core/features/auth/types';

const inviteSchema = new Schema<Invite>(
  {
    code: { type: String, required: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: { type: Number },
  },
  {
    versionKey: false,
  }
);

const InviteModel = models.Invite || model('Invite', inviteSchema);

export default InviteModel;
