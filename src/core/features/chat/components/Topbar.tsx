'use client';

import { PropsWithChildren } from 'react';

import { cn } from '@/core/utils';

type TopbarProps = PropsWithChildren & {
  className?: string;
};

const Topbar = ({ className, children }: TopbarProps) => {
  return (
    <div className={cn('topbar flex items-center px-4', className)}>
      {children}
    </div>
  );
};

export default Topbar;
