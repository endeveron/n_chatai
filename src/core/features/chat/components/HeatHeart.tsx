'use client';

import { useEffect, useMemo, useState } from 'react';

import { HeartIcon } from '@/core/components/icons/HeartIcon';
import { MAX_HEAT_LEVEL } from '@/core/features/chat/constants';

interface HeatHeartProps {
  heatLevel: number;
}

const HeatHeart = ({ heatLevel }: HeatHeartProps) => {
  const [isHeartBeating, setHeartBeating] = useState(false);

  // Calculate fill percentage (0-100%)
  const fillPercentage = useMemo(() => {
    return Math.max(0, Math.min(100, (heatLevel / MAX_HEAT_LEVEL) * 100));
  }, [heatLevel]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (heatLevel > MAX_HEAT_LEVEL) {
      timeout = setTimeout(() => {
        setHeartBeating(true);
      }, 1000);
    }

    if (isHeartBeating && heatLevel <= MAX_HEAT_LEVEL) {
      setHeartBeating(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [heatLevel, isHeartBeating]);

  return (
    <div className="mr-1 relative h-5.5 w-6">
      <div className="absolute z-10 inset-0 text-muted/25 dark:text-muted/40">
        <HeartIcon />
      </div>
      <div
        className="absolute z-20 inset-0 text-accent transition-all ease-in-out duration-1000"
        style={{
          clipPath: `inset(${100 - fillPercentage}% 0 0 0)`,
        }}
      >
        <HeartIcon />
      </div>
      {isHeartBeating ? (
        <div
          className="absolute z-30 inset-0 text-accent animate-ping"
          style={{
            clipPath: `inset(${100 - fillPercentage}% 0 0 0)`,
          }}
        >
          <HeartIcon />
        </div>
      ) : null}
    </div>
  );
};

export default HeatHeart;
