'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { NavBackIcon } from '@/core/components/icons/NavBackIcon';
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

export const TopbarNavBack = ({ navPath }: { navPath?: string }) => {
  const router = useRouter();

  const handleNavigate = () => {
    if (!navPath) return;
    if (navPath === '-1') router.back();
    else router.push(navPath);
  };

  return (
    !!navPath && (
      <div className="topbar_navback w-6 h-6" onClick={handleNavigate}>
        <NavBackIcon className="icon--action" />
      </div>
    )
  );
};

export const TopbarTitle = ({ className, children }: TopbarProps) => {
  return <h2 className={cn('select-none', className)}>{children}</h2>;
};

export default Topbar;
