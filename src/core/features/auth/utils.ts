// import { STALENESS_CONFIG } from '@/core/features/auth/config';
import { ExtendedSession } from '@/core/features/auth/types';

// export function isSessionStale(
//   session: ExtendedSession | null,
//   lastRefreshTime: number
// ): boolean {
//   if (!session) return false;

//   const now = Date.now();

//   // Check if session is close to expiring
//   if (session.expires) {
//     const expiryTime = new Date(session.expires).getTime();
//     const timeUntilExpiry = expiryTime - now;

//     if (timeUntilExpiry <= STALENESS_CONFIG.EXPIRY_THRESHOLD) {
//       console.log(
//         'Session is close to expiring:',
//         timeUntilExpiry / 1000,
//         'seconds left'
//       );
//       return true;
//     }
//   }

//   // // Check if access token is close to expiring (if you have this data)
//   // if (session.accessTokenExpiry) {
//   //   const timeUntilAccessExpiry = session.accessTokenExpiry - now;

//   //   if (timeUntilAccessExpiry <= STALENESS_CONFIG.EXPIRY_THRESHOLD) {
//   //     console.log(
//   //       'Access token is close to expiring:',
//   //       timeUntilAccessExpiry / 1000,
//   //       'seconds left'
//   //     );
//   //     return true;
//   //   }
//   // }

//   // Check if session is too old (based on when token was issued)
//   if (session.iat) {
//     const sessionAge = now - session.iat * 1000; // iat is in seconds

//     if (sessionAge > STALENESS_CONFIG.MAX_AGE) {
//       console.log('Session is too old:', sessionAge / 1000 / 60, 'minutes old');
//       return true;
//     }
//   }

//   // 4. Check if we haven't refreshed in a while and should proactively refresh
//   const timeSinceLastRefresh = now - lastRefreshTime;
//   if (timeSinceLastRefresh > STALENESS_CONFIG.MIN_REFRESH_INTERVAL) {
//     // You could add additional conditions here, like:
//     // - User just became active after inactivity
//     // - Critical user action is about to be performed
//     // - etc.
//     return false; // Disabled by default, enable based on your needs
//   }

//   return false;
// }

// Client-side API helper that takes session as parameter
export async function authenticatedFetch(
  url: string,
  session: ExtendedSession | null,
  options: RequestInit = {}
): Promise<Response> {
  if (!session?.accessToken) {
    throw new Error('No access token available');
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  // If token is expired, the session will be refreshed automatically
  // by NextAuth on the next useSession call
  if (response.status === 401) {
    throw new Error('Unauthorized - token may be expired');
  }

  return response;
}

// Convenience wrapper for common HTTP methods
export function createAuthenticatedApi<T>(session: ExtendedSession | null) {
  return {
    get: async (url: string, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'GET',
        ...options,
      });
    },

    post: async (url: string, data?: T, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
    },

    put: async (url: string, data?: T, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
    },

    delete: async (url: string, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'DELETE',
        ...options,
      });
    },

    patch: async (url: string, data?: T, options?: RequestInit) => {
      return authenticatedFetch(url, session, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });
    },
  };
}

// Type-safe API response handler
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: 'Unknown error' }));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  return response.text() as unknown as T;
}
