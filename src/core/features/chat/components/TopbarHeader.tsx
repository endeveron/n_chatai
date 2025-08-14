'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

import { NavBackIcon } from '@/core/components/icons/NavBackIcon';

type TopbarHeaderProps = PropsWithChildren & {
  title?: string;
  navPath?: string;
};

const TopbarHeader = ({ title, navPath, children }: TopbarHeaderProps) => {
  const router = useRouter();

  const handleNavigate = () => {
    if (!navPath) return;
    if (navPath === '-1') router.back();
    else router.push(navPath);
  };

  const navEl = !!navPath && (
    <div className="navback mr-3 -ml-1" onClick={handleNavigate}>
      <NavBackIcon className="icon--action" />
    </div>
  );

  return (
    <header className="topbar-header w-full flex items-center">
      {navEl}
      <h2 className="w-full flex justify-center">{title}</h2>

      {children}
    </header>
  );
};

export default TopbarHeader;
