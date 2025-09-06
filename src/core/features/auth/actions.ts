'use server';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { AuthError } from 'next-auth';

import { signIn as nextSignIn } from '~/auth';

import { BASE_URL, DEFAULT_REDIRECT, EMAIL_JWT } from '@/core/constants';
import InviteModel from '@/core/features/auth/models/invite';
import UserModel from '@/core/features/auth/models/user';
import {
  CreateUserArgs,
  Credentials,
  JwtEmailPayload,
  OnboardUserArgs,
  SignInArgs,
  SignInSocialArgs,
  SignUpArgs,
} from '@/core/features/auth/types';
import { mongoDB } from '@/core/lib/mongo';
import {
  configureVerificationEmail,
  sendEmail,
  SendEmailArgs,
} from '@/core/lib/nodemailer';
import { EmailType, ServerActionResult } from '@/core/types/common';
import { User, UserRole } from '@/core/types/user';
import { generateCode } from '@/core/utils';
import { handleActionError } from '@/core/utils/error';
import { configureUser } from '@/core/utils/user';

export const createInviteCode = async (): Promise<ServerActionResult> => {
  try {
    await mongoDB.connect();

    await InviteModel.create({
      code: generateCode(8),
    });

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to create a new user', err);
  }
};

export const checkInviteCode = async (
  code: string
): Promise<ServerActionResult> => {
  try {
    await mongoDB.connect();

    const codeDoc = await InviteModel.findOne({ code });

    if (!codeDoc || codeDoc.userId) {
      return {
        success: false,
        error: { message: 'Invalid code' },
      };
    }

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to create a new user', err);
  }
};

/**
 * Creates a new user in a database and returns the user's object ID.
 *
 * @param {string} params.email An email address of the user.
 * @returns A Promise that resolves to either a ServerActionResult object or undefined.
 */
export const createUser = async ({
  email,
}: CreateUserArgs): Promise<ServerActionResult> => {
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
  inviteCode,
}: OnboardUserArgs): Promise<ServerActionResult> => {
  if (!userId || !password || !inviteCode) {
    return handleActionError('onboardUser: Invalid input data provided');
  }

  try {
    await mongoDB.connect();

    // Find the user
    const user = await UserModel.findById(userId);
    if (!user) {
      return handleActionError('Unable to find user for the provided ID');
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

    // Mark the invite code as used
    const code = await InviteModel.findOne({ code: inviteCode });
    if (!code || code.userId) {
      return handleActionError('Invalid invite code');
    }
    code.userId = user._id;
    code.timestamp = Date.now();
    await code.save();

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to onboard user', err);
  }
};

/**
 * Retrieves a user from the database by their email.
 *
 * @param {string} email user's email address.
 * @returns a Promise that resolves to a `TServerActionResult` object or `undefined`.
 */
export const getUserIdByEmail = async (
  email: string
): Promise<ServerActionResult<string | null>> => {
  try {
    await mongoDB.connect();

    const user = await UserModel.findOne<User>({ email: email }).select('id');
    if (!user) {
      return handleActionError('Unable to find user for the provided email');
    }

    return {
      success: true,
      data: user._id.toString(),
    };
  } catch (err: unknown) {
    return handleActionError('Unable to fetch user id', err);
  }
};

/**
 * Generates a JWT token for email verification using a user's object ID.
 *
 * @param {string} userId user._id, a mongoDb ObjectId prop of the user object.
 * @returns a JSON Web Token (JWT) that is signed with the userId and jwtEmailKey. The token has an
 * expiration time of 24 hours.
 */
const generateEmailToken = (userId: string) => {
  return jwt.sign({ userId }, EMAIL_JWT!, { expiresIn: '24h' });
};

/**
 * Responsible for sending a verification email to a user, including generating a verification token and checking if the email is already in use.
 *
 * @param {string} params.email the email address to which the verification email will be sent.
 * @param {boolean} params.isSignup whether to check if the email is already in use.
 * @returns a Promise that resolves to a value of type `ServerActionResult` or `undefined`.
 */
export const confirmEmail = async ({
  email,
  emailType,
  isSignup = false,
}: {
  email: string;
  emailType?: EmailType;
  isSignup?: boolean;
}): Promise<ServerActionResult> => {
  try {
    await mongoDB.connect();

    let userId: string | null = null;

    // Check if the user exists
    const user = await UserModel.findOne({ email });

    // Signup case: check if email in use
    if (isSignup && user) {
      return handleActionError('Email already in use');
    }

    // Resend case: check if email in use
    if (!isSignup && !user) {
      return handleActionError(
        'The user with the specified email does not exist'
      );
    }

    // Check if email is confirmed
    if (user?.emailConfirmed === true) {
      return handleActionError(
        emailType === EmailType.PROMOTION
          ? `It looks like you've already taken advantage of the program`
          : 'Email has already been confirmed'
      );
    }

    // Signup case: create a user
    if (isSignup && !user) {
      const res = await createUser({ email });
      if (!res?.success) {
        return handleActionError('Could not create user', res?.error, true);
      }
      userId = (res.data as { userId: string }).userId;
    }

    if (!userId) {
      return handleActionError('Unable to create user');
    }

    // Generate email token
    const token = generateEmailToken(userId);

    // Configure email data
    const url = `${BASE_URL}/email/result?e=${email}&t=${token}&i=${userId}`;
    const emailData: SendEmailArgs = configureVerificationEmail({
      email,
      url: encodeURI(url),
    });

    // Send the email
    const messageSent = await sendEmail(emailData);
    if (!messageSent) {
      handleActionError('An email transporter error occured', null, true);
    }

    return { success: true };
  } catch (err: unknown) {
    return handleActionError('Could not send verification token', err);
  }
};

/**
 * Verifies the validity of an email verification token by checking the
 * token's expiration and comparing the user ObjectId in the token with the provided user ObjectId.
 *
 * @param {string} params.userId user._id, a mongoDb ObjectId prop of the user object that the token belongs to.
 * @param {string} params.token a token.
 * @returns an object with either an "error" property or a "data" property.
 */
export const verifyEmailToken = async ({
  userId,
  token,
}: {
  userId: string;
  token: string;
}): Promise<ServerActionResult> => {
  // Get token data
  const { userId: UserIdFromToken, exp } = jwt.verify(
    token,
    EMAIL_JWT
  ) as JwtEmailPayload;

  // Check if token expired.
  if (Date.now() >= exp * 1000) {
    return {
      success: false,
      error: {
        code: 1,
        message: 'Token is expired',
      },
    };
  }

  // Check token validity.
  if (userId !== UserIdFromToken) {
    return {
      success: false,
      error: {
        code: 2,
        message: 'Token is invalid',
      },
    };
  }

  try {
    await mongoDB.connect();

    // Check if a user with the given `userId` exists in the db
    const user: User | null = await UserModel.findById(userId);
    if (user?.name) {
      return {
        success: true,
        data: 'created',
      };
    }

    return { success: true, data: 'onboard' };
  } catch (err: unknown) {
    console.error(err);
    return {
      success: false,
      error: {
        code: 3,
        message: 'DB error',
      },
    };
  }
};

/**
 * Checks the validity of a user object ID and verifies if a user with that ID exists in the database.
 *
 * @param {string} userId user._id, a mongoDb ObjectId prop in the user object.
 * @returns a Promise that resolves to a value of type `ServerActionResult`.
 */
export const verifyUserId = async (
  userId: string
): Promise<ServerActionResult> => {
  try {
    // Check the `userId` validity
    if (!Types.ObjectId.isValid(userId)) {
      return handleActionError('Invalid ID data', null, true);
    }

    // Check if a user with the given `userId` exists in the db
    const user = await UserModel.findById(userId);
    if (!user) {
      return handleActionError('Invalid user ID', null, true);
    }

    // Update email status
    user.emailConfirmed = true;
    await user.save();

    return {
      success: true,
    };
  } catch (err: unknown) {
    return handleActionError('Unable to onboard', err, true);
  }
};

// /**
//  * Generates a JWT token for the user authentication using a user's object ID.
//  *
//  * @param {string} userId user._id, a mongoDb ObjectId prop of the user object.
//  * @returns a JSON Web Token (JWT) that is signed with the userId and jwtAuthKey. The token has an
//  * expiration time of 72 hours.
//  */
// export const generateAuthToken = async (userId: string) => {
//   return jwt.sign({ userId }, EMAIL_JWT, { expiresIn: '72h' });
// };

/**
 * Resends a verification email to a user's email address for email verification.
 *
 * @param {string} params.email email address to which the verification email will be sent.
 * @returns a Promise that resolves to a value of type `ServerActionResult` or `undefined`.
 */
export const resendVerifyEmailLink = async ({
  email,
}: SignUpArgs): Promise<ServerActionResult> => {
  try {
    // Verify the user email by sending authentication link
    const res = await confirmEmail({ email });
    if (!res?.success) return handleActionError('', res?.error, true);
    return { success: true };
  } catch (err: unknown) {
    return handleActionError('Unable to send a link', err);
  }
};

/**
 * Sends a verification email to a user's email address for email verification.
 *
 * @param {string} params.email email address to which the verification email will be sent.
 * @returns a Promise that resolves to a value of type `ServerActionResult` or `undefined`.
 */
export const signUp = async ({
  email,
}: SignUpArgs): Promise<ServerActionResult> => {
  try {
    // Verify the user email by sending authentication link
    const res = await confirmEmail({ email, isSignup: true });
    if (!res?.success) return handleActionError('', res?.error, true);
    return { success: true };
  } catch (err: unknown) {
    return handleActionError('Unable to signup', err);
  }
};

/**
 * Handles user signin using email and password, calling an authentication method.
 *
 * @param {string} params.email email address of the user.
 * @param {string} params.password password to the user account.
 * @returns a Promise that resolves to a value of type `ServerActionResult` or `undefined`.
 */
export const signIn = async ({
  email,
  password,
  redirectTo,
}: SignInArgs): Promise<ServerActionResult> => {
  try {
    // Call the `auth.providers.Credentials.authorize` method (./auth.ts)
    await nextSignIn('credentials', {
      email,
      password,
      redirectTo: redirectTo ? `/${redirectTo}` : DEFAULT_REDIRECT,
    });
    return { success: true };
  } catch (err: unknown) {
    // Do not use handleActionError here
    if (err instanceof AuthError) {
      switch (err.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            error: { message: 'Invalid email or password' },
          };
        default:
          return {
            success: false,
            error: { message: 'Unable to sign in' },
          };
      }
    }
    throw err;
  }
};

/**
 * Checks user credentials against a database and returns user data if authentication is successful.
 *
 * @param {string} params.email email address of the user.
 * @param {string} params.password password to the user account.
 * @returns either the user data (id, name, email, role) if the provided email and password match a user in the database, or `null` if no user is found or the password does not match.
 */
export const authorizeUser = async ({ email, password }: Credentials) => {
  try {
    await mongoDB.connect();

    // Find a user document in the db that matches the provided email address.
    const user = await UserModel.findOne<User>({ email });
    if (!user || !user.id || !user.email || !user.role) return null;

    // Check the password
    const passwordsMatch = await bcrypt.compare(
      password,
      user.password as string
    );

    const userData = {
      id: user.id as string,
      name: user.name as string,
      email: user.email as string,
      role: user.role as UserRole,
      isPremium: !!user?.premium?.timestamp as boolean,
    };

    // Debug logging
    // console.log('User data being returned from authorizeUser:', userData);
    // console.log('Premium value:', userData.premium);

    if (passwordsMatch) return userData;
    return null;
  } catch (err: unknown) {
    handleActionError('Unable to authorize user', err);
    return null;
  }
};

/**
 * Handles user signin with social providers, creating a new user or updating existing user information in the database.
 *
 * @param {string} params.provider SocialProvider enum value.
 * @param {string} params.email user's email address.
 * @param {boolean} params.emailConfirmed
 * @param {string} params.name name of the user.
 * @param {string} params.image image avatar of the user.
 * @returns a Promise that resolves to a value of type `ServerActionResult` or `undefined`.
 */
export const signInSocial = async ({
  provider,
  email,
  emailConfirmed,
  name,
  image,
}: SignInSocialArgs): Promise<ServerActionResult> => {
  try {
    await mongoDB.connect();

    // Check if the user exists
    let user = await UserModel.findOne({ email: email });

    if (!user) {
      if (!email) return handleActionError('No email provided', null, true);

      // Create a new user in the database
      const _id = new Types.ObjectId();
      user = new UserModel({
        _id,
        id: _id.toString(),
        provider,
        email,
        emailConfirmed,
        name,
        image,
      });
      await user.save();
    } else {
      if (user.provider && user.name && user.image && user.emailConfirmed) {
        return { success: true };
      }
      // Update an existing user fields in the database
      if (!user.provider) user.provider = provider;
      if (!user.name && name) user.name = name;
      if (!user.image && image) user.image = image;
      if (!user.emailConfirmed && emailConfirmed === true)
        user.emailConfirmed = true;
      await user.save();
    }
    return { success: true };
  } catch (err: unknown) {
    return handleActionError('Could not handle user data', err, true);
  }
};
