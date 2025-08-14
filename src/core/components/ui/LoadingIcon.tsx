'use client';

import { cn } from '@/core/utils';

type TLoadingIconProps = {
  size?: number;
  thickness?: number;
  className?: string;
};

const LoadingIcon = ({
  className,
  size = 24,
  thickness = 3,
}: TLoadingIconProps) => {
  return (
    <div className={cn('loading-icon', className)}>
      <div
        className="border-accent border-t-transparent rounded-full animate-spin"
        style={{ width: size, height: size, borderWidth: thickness }}
      />
    </div>
  );
};

export default LoadingIcon;
