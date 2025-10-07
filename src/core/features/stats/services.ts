import {
  APP_ID,
  STATS_API_ACCESS_TOKEN,
  STATS_API_URL,
} from '@/core/constants';
import { AuthData } from '@/core/features/auth/types';
import { APIResult } from '@/core/types';

export const persistAuthData = async (
  data: AuthData
): Promise<APIResult<boolean>> => {
  try {
    const response = await fetch(STATS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        appId: APP_ID,
        token: STATS_API_ACCESS_TOKEN,
        ...data,
      }),
    });

    const statRes = await response.json();
    return { data: statRes?.data?.success };
  } catch (err: unknown) {
    console.error(err);
    return { data: false };
  }
};
