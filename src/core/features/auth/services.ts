import { STATS_URL } from '@/core/constants';
import { StatData } from '@/core/features/auth/types';
import { APIResult } from '@/core/types/common';

export const handleStatistics = async (
  data: StatData
): Promise<APIResult<boolean>> => {
  try {
    const response = await fetch(STATS_URL, {
      method: 'POST',
      body: JSON.stringify(data),
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
