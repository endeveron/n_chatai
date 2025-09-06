import mongoose from 'mongoose';

import { generateCode } from '@/core/utils';

export const configureUser = ({ email }: { email: string }) => {
  const _id = new mongoose.Types.ObjectId();
  const userId = _id.toString();

  // Properties to be added by mongoose:
  // - emailConfirmed: false,
  // - role: 'user'

  return {
    _id,
    balance: 0,
    id: userId,
    email,
    referralProgram: {
      code: generateCode(8),
    },
    statistics: [],
    activity: [],
  };
};
