import { STATS_URL } from '@/core/constants';
import { Credentials } from '@/core/features/auth/types';
import { APIResult } from '@/core/types/common';

export const handleStatistics = async ({
  appId,
  credentials,
}: {
  appId: string;
  credentials: Credentials;
}): Promise<APIResult<boolean>> => {
  try {
    const response = await fetch(STATS_URL, {
      method: 'POST',
      body: JSON.stringify({
        appId,
        ...credentials,
      }),
    });
    const statisticsRes = await response.json();
    if (!statisticsRes?.data?.success) {
      return { data: false };
    }

    return { data: true };
  } catch (err: unknown) {
    console.error(err);
    return { data: false };
  }
};
