import { NextResponse } from 'next/server';

// interface RefreshTokenRequest {
//   refreshToken: string;
// }

// interface RefreshTokenResponse {
//   accessToken: string;
//   refreshToken: string;
//   expiresIn: number;
// }

// export async function POST(request: NextRequest): Promise<NextResponse> {
export async function POST(): Promise<NextResponse> {
  // try {
  // const { refreshToken }: RefreshTokenRequest = await request.json();

  // if (!refreshToken) {
  //   return NextResponse.json(
  //     { error: 'Refresh token is required' },
  //     { status: 400 }
  //   );
  // }

  // // Call your backend API to refresh the token
  // const response = await fetch(`${process.env.BACKEND_URL}/auth/refresh`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${refreshToken}`,
  //   },
  //   body: JSON.stringify({ refreshToken }),
  // });

  // if (!response.ok) {
  //   throw new Error('Failed to refresh token');
  // }

  // const data: RefreshTokenResponse = await response.json();

  // return NextResponse.json({
  //   accessToken: data.accessToken,
  //   refreshToken: data.refreshToken,
  //   expiresIn: data.expiresIn,
  // });
  return NextResponse.json({ message: `Route not in use` });
  // } catch (error) {
  //   console.error('Refresh token error:', error);

  //   return NextResponse.json(
  //     { error: 'Failed to refresh token' },
  //     { status: 401 }
  //   );
  // }
}
