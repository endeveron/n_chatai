'use server';

import bcrypt from 'bcryptjs';

import { mongoDB } from '@/core/lib/mongo';
import UserModel from '@/core/models/user';
import { CreateUserArgs, OnboardUserArgs } from '@/core/features/auth/types';
import { ServerActionResult } from '@/core/types/common';
import { handleActionError } from '@/core/utils/error';
import { configureUser } from '@/core/utils/user';

/**
 * Creates a new user in a database and returns the user's object ID.
 *
 * @param {string} params.email An email address of the user.
 * @returns A Promise that resolves to either a ServerActionResult object or undefined.
 */
export const createUser = async ({
  email,
}: CreateUserArgs): Promise<ServerActionResult | undefined> => {
  if (!email) {
    return handleActionError('createUser: No user email provided');
  }

  try {
    await mongoDB.connect();

    const userData = configureUser({ email });

    await UserModel.create(userData);

    return {
      success: true,
      data: { userId: userData.id },
    };
  } catch (err: unknown) {
    return handleActionError('Unable to create a new user', err);
  }
};

/**
 * Creates a new user in a database, hash their password, and add stringified.
 * Used in the `OnboardingForm` client component.
 *
 * @param {string} userId user._id, a mongoDb ObjectId prop of the user object.
 * @param {string} params.name name of the user.
 * @param {string} params.password password to the user account.
 * @returns A Promise that resolves to a ServerActionResult object or undefined.
 */
export const onboardUser = async ({
  userId,
  name,
  password,
}: OnboardUserArgs): Promise<ServerActionResult | undefined> => {
  if (!userId || !password) {
    return handleActionError('onboardUser: Invalid input data provided');
  }

  try {
    await mongoDB.connect();

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      handleActionError('Invalid user ID', null, true);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save password hash
    if (user?.password !== hashedPassword) {
      user.id = userId; // Add a stringified version of userId
      if (name) user.name = name;
      user.password = hashedPassword;
      await user.save();
    }

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to onboard user', err);
  }
};

// /**
//  * Checks if the user with the provided email is exists in database.
//  *
//  * @param {string} email user's email address.
//  * @returns a Promise that resolves to a `ServerActionResult` object or `undefined`.
//  */
// export const handleGoogleSigninData = async ({
//   email,
//   password,
//   referrerCode,
// }: Credentials & { referrerCode: string | null }): Promise<
//   | ServerActionResult<{
//       userId: string;
//       referralCode: string;
//       referrerCode?: string;
//     }>
//   | undefined
// > => {
//   if (!email || !password) {
//     return handleActionError(
//       'handleGoogleSigninData: Invalid input data provided'
//     );
//   }

//   try {
//     await mongoDB.connect();
//     const errMsg = 'Unable to signin';

//     if (!email || !password) {
//       return handleActionError(`${errMsg}. Unable to get credentials`);
//     }

//     const user = await UserModel.findOne({ email });
//     if (!user) {
//       return handleActionError(`${errMsg}. Unable to get user data from db`);
//     }

//     // Hash the provided password and save to db
//     const hashedPassword = await bcrypt.hash(password, 12);
//     user.password = hashedPassword;

//     // Handle the referrer code if provided
//     if (referrerCode && !user.referrerCode && user.emailConfirmed) {
//       // Save referrer code
//       user.referralProgram.referrerCode = referrerCode;

//       // Update referrer data
//       const referrer = await UserModel.findOne({
//         'referralProgram.code': referrerCode,
//       });
//       if (!referrer) {
//         return handleActionError(`${errMsg}. Unable to find referrer`);
//       }
//       referrer.balance += INVITE_BONUS;
//       referrer.referralProgram.referals.push(user._id);
//       await referrer.save();
//     }
//     await user.save();

//     return {
//       success: true,
//       data: {
//         userId: user.id,
//         referralCode: user.referralProgram.code,
//         referrerCode: user.referralProgram?.referrerCode,
//       },
//     };
//   } catch (err: unknown) {
//     console.error(err);
//     return handleActionError('Unable to signin', err);
//   }
// };

// export const getUserData = async (
//   email: string
// ): Promise<
//   | ServerActionResult<{
//       balance: number;
//       emailConfirmed: boolean;
//       referralCode: string;
//     }>
//   | undefined
// > => {
//   if (!email) {
//     return handleActionError('getUserData: No user email provided');
//   }

//   try {
//     await mongoDB.connect();

//     const user = await UserModel.findOne({ email: email }).select(
//       'balance emailConfirmed referralProgram.code'
//     );
//     if (!user) {
//       return handleActionError('Unable to find a user for the provided email');
//     }

//     const data = {
//       balance: user.balance,
//       emailConfirmed: user.emailConfirmed,
//       referralCode: user.referralProgram.code,
//     };

//     return {
//       success: true,
//       data,
//     };
//   } catch (err: unknown) {
//     return handleActionError('Unable to get email status', err);
//   }
// };
