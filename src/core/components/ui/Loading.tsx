'use client';

import { useEffect, useState } from 'react';

import LoadingIcon from '@/core/components/ui/LoadingIcon';
import { cn } from '@/core/utils';

interface LoadingFragmentProps {
  size?: number;
  thickness?: number;
  className?: string;
  showOverlay?: boolean;
  delay?: number;
}

const Loading = ({
  className,
  size = 24,
  thickness,
  showOverlay,
  delay = 0,
}: LoadingFragmentProps) => {
  const [showLoading, setShowLoading] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      className={cn(
        'loading w-full flex-center',
        showOverlay && 'bg-background/70',
        className
      )}
    >
      <div className={cn('trans-o', showLoading ? 'opacity-100' : 'opacity-0')}>
        <LoadingIcon size={size} thickness={thickness} />
      </div>
    </div>
  );
};

export default Loading;
