'use client';

import { useState } from 'react';

import LoadingIcon from '@/core/components/ui/LoadingIcon';
import { useSessionWithRefresh } from '@/core/features/auth/hooks/use-session-with-refresh';

const SignOutButton = () => {
  const { status, isLoading, signOutSafely } = useSessionWithRefresh();
  const [pending, setPending] = useState(false);

  const handleClick = () => {
    setPending(true);
    signOutSafely();
  };

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div onClick={handleClick}>
      {pending || isLoading ? (
        <LoadingIcon className="scale-75" />
      ) : (
        <span className="cursor-pointer">Sign Out</span>
      )}
    </div>
  );
};

export default SignOutButton;
