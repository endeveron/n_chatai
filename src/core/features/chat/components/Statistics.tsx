'use client';

import { useCallback, useState } from 'react';
import { ChartLine } from 'lucide-react';

import { useSessionWithRefresh } from '@/core/features/auth/hooks/use-session-with-refresh';
import { getUsageStatistics } from '@/core/features/chat/actions/chat';
import { cn } from '@/core/utils';
import { UserRole } from '@/core/types/user';
import { Button } from '@/core/components/ui/Button';

const Statistics = () => {
  const { session } = useSessionWithRefresh();

  const [tokens, setTokens] = useState<number | null>(null);
  const [fetching, setFetching] = useState(false);

  const userId = session?.user.id;
  const userRole = session?.user.role;

  const getStatistics = useCallback(async () => {
    if (!userId) return;

    setFetching(true);
    const res = await getUsageStatistics(userId);
    if (res?.success && res.data) {
      setTokens(res.data);
    }
    setFetching(false);
  }, [userId]);

  const handleRefresh = () => {
    getStatistics();
  };

  if (userRole !== UserRole.admin) return null;

  return (
    <div className="relative w-6 h-9">
      <div
        className={cn(
          'absolute left-0 flex-center gap-2 text-muted text-sm cursor-default transition-opacity duration-300',
          fetching && 'opacity-20 pointer-events-none'
        )}
      >
        <Button variant="secondary" className="h-9 w-9" onClick={handleRefresh}>
          <ChartLine size={20} />
        </Button>
        {tokens}
      </div>
    </div>
  );
};

export default Statistics;
