import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

import UserModel from '@/core/features/auth/models/user';
import { APIResult } from '@/core/types';
import { STATS_API_ACCESS_TOKEN } from '@/core/constants';

export async function POST(
  request: NextRequest
): Promise<NextResponse<APIResult<{ hashedPassword: string }>>> {
  const body = await request.json();
  const { email, password, token } = body;

  if (!email || !password) {
    return NextResponse.json({
      data: null,
      error: 'Invalid data provided in the request body',
    });
  }

  if (!token || token !== STATS_API_ACCESS_TOKEN) {
    return NextResponse.json({
      data: null,
      error: 'Invalid access token',
    });
  }

  try {
    // Find a user by email
    const user = await UserModel.findOne({ email });
    if (!user) {
      return NextResponse.json({
        data: null,
        error: 'Could not find a user for the provided email',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    if (!hashedPassword) {
      return NextResponse.json({
        data: null,
        error: 'Unable to create password hash.',
      });
    }

    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({
      data: {
        success: true,
        hashedPassword,
      },
    });
  } catch (err: unknown) {
    console.error(`POST api/auth/save-password ${err}`);
    return NextResponse.json({
      data: null,
      error: `Unable to create password hash. Unexpected error.`,
    });
  }
}
