import { GlobalAuthState } from '@/core/features/auth/types';

// Global state to track authentication across components
const globalAuthState: GlobalAuthState = {
  isSigningOut: false,
  isSignedOut: false,
  lastSignOutTime: 0,
  sessionId: null,
  signOutCount: 0,
};

export const authStateManager = {
  setSigningOut: (value: boolean) => {
    if (value) {
      globalAuthState.signOutCount++;
      globalAuthState.isSigningOut = true;
    } else {
      globalAuthState.isSigningOut = false;
      // Reset count after a delay to allow cleanup
      setTimeout(() => {
        globalAuthState.signOutCount = 0;
      }, 2000);
    }
  },

  setSignedOut: (value: boolean) => {
    globalAuthState.isSignedOut = value;
    if (value) {
      globalAuthState.lastSignOutTime = Date.now();
      globalAuthState.sessionId = null;
    }
  },

  setSessionId: (id: string | null) => {
    globalAuthState.sessionId = id;
    if (id) {
      globalAuthState.isSignedOut = false;
    }
  },

  shouldPreventSessionCalls: (): boolean => {
    // Prevent calls if actively signing out
    if (globalAuthState.isSigningOut) return true;

    // Prevent calls if recently signed out (within 10 seconds)
    if (
      globalAuthState.isSignedOut &&
      Date.now() - globalAuthState.lastSignOutTime < 10000
    ) {
      return true;
    }

    // Prevent calls if multiple sign-out attempts are happening
    if (globalAuthState.signOutCount > 0) return true;

    return false;
  },

  canSignOut: (): boolean => {
    // Prevent multiple simultaneous sign-outs
    return !globalAuthState.isSigningOut && globalAuthState.signOutCount === 0;
  },

  getState: () => ({ ...globalAuthState }),
};
