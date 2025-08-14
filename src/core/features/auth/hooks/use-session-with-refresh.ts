import { signOut, useSession } from 'next-auth/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { SIGNIN_REDIRECT } from '@/core/constants';
import { authStateManager } from '@/core/features/auth/state';
import { ExtendedSession } from '@/core/features/auth/types';

interface UseSessionWithRefreshReturn {
  session: ExtendedSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  isLoading: boolean;
  refreshSession: () => Promise<ExtendedSession | null>;
  signOutSafely: () => Promise<void>;
}

export function useSessionWithRefresh(): UseSessionWithRefreshReturn {
  const { data: session, status, update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const signOutInProgress = useRef(false);

  // Track session changes to update global state
  useEffect(() => {
    if (session?.user) {
      authStateManager.setSessionId(session.user.id || 'anonymous');
    }
  }, [session?.user]);

  // Safe refresh function that respects logout state
  const refreshSession = useCallback(async () => {
    if (authStateManager.shouldPreventSessionCalls() || isRefreshing) {
      return null;
    }

    try {
      setIsRefreshing(true);
      const updatedSession = await update();
      return updatedSession as ExtendedSession | null;
    } catch (error) {
      console.warn('Session refresh failed:', error);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [update, isRefreshing]);

  // Safe sign out function with multiple simultaneous sign-out prevention
  const signOutSafely = useCallback(async (): Promise<void> => {
    // Prevent multiple simultaneous sign-outs using both ref and global state
    if (signOutInProgress.current || !authStateManager.canSignOut()) {
      // console.log('Sign out already in progress, skipping...');
      return;
    }

    try {
      signOutInProgress.current = true;
      authStateManager.setSigningOut(true);

      // console.log('Starting sign out process...');

      // Clear any pending refresh timers
      setIsRefreshing(false);

      await signOut({
        callbackUrl: SIGNIN_REDIRECT,
        redirect: true,
      });

      authStateManager.setSignedOut(true);
      // console.log('Sign out completed');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Reset the ref immediately
      signOutInProgress.current = false;
      // Reset global state with delay to allow cleanup
      setTimeout(() => {
        authStateManager.setSigningOut(false);
      }, 1500);
    }
  }, []);

  // Conditional auto-refresh logic
  useEffect(() => {
    if (authStateManager.shouldPreventSessionCalls() || isRefreshing) {
      return;
    }

    // Only attempt refresh if we have a valid state for it
    if (
      status === 'unauthenticated' &&
      !session &&
      !authStateManager.getState().isSignedOut
    ) {
      const timer = setTimeout(() => {
        refreshSession();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [status, session, refreshSession, isRefreshing]);

  // Reset state on successful authentication
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      authStateManager.setSignedOut(false);
    }
  }, [status, session?.user]);

  return {
    session: session as ExtendedSession | null,
    status,
    isLoading: status === 'loading' || isRefreshing,
    refreshSession,
    signOutSafely,
  };
}
