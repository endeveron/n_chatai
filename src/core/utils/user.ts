import mongoose from 'mongoose';

import { generateReferralCode } from '@/core/utils';

export const configureUser = ({ email }: { email: string }) => {
  const _id = new mongoose.Types.ObjectId();
  const userId = _id.toString();
  const referralCode = generateReferralCode();

  // Properties to be added by mongoose:
  // - emailConfirmed: false,
  // - role: 'user'

  return {
    _id,
    balance: 0,
    id: userId,
    email,
    referralProgram: {
      code: referralCode,
    },
    statistics: [],
    activity: [],
  };
};
