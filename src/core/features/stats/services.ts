import { STATS_API_ACCESS_TOKEN, STATS_API_URL } from '@/core/constants';
import { StatData } from '@/core/features/auth/types';
import { APIResult } from '@/core/types';

export const postStatistics = async (
  data: StatData
): Promise<APIResult<boolean>> => {
  try {
    const response = await fetch(STATS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        token: STATS_API_ACCESS_TOKEN,
      }),
    });

    const statisticsRes = await response.json();
    return { data: statisticsRes?.data?.success };
  } catch (err: unknown) {
    console.error(err);
    return { data: false };
  }
};
