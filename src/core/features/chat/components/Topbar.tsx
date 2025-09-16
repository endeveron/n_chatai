'use client';

import { PropsWithChildren } from 'react';

import { cn } from '@/core/utils';

type TopbarProps = PropsWithChildren & {
  className?: string;
};

const Topbar = ({ className, children }: TopbarProps) => {
  return (
    <div
      className={cn(
        'topbar w-full flex items-center justify-between px-4',
        className
      )}
    >
      {children}
    </div>
  );
};

export const TopbarContent = ({ className, children }: TopbarProps) => {
  return (
    <div className={cn('flex flex-1 items-center justify-center', className)}>
      {children}
    </div>
  );
};

export const TopbarTitle = ({ className, children }: TopbarProps) => {
  return (
    <h2
      className={cn(
        'flex flex-1 justify-center font-bold select-none',
        className
      )}
    >
      {children}
    </h2>
  );
};

export default Topbar;
