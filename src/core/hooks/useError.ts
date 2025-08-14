'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

export const useError = () => {
  /**
   * Displays an error toast with a title based on the provided error object.
   * @param {unknown} err - An error of unknown type that will be safely handled
   */
  const toastError = useCallback((err: unknown) => {
    if (!err) return;
    let title;

    // Handle Error objects
    if (err instanceof Error) {
      title = err.message;
    }
    // Handle server action errors (ServerActionError shape)
    else if (
      typeof err === 'object' &&
      err !== null &&
      'success' in err &&
      err.success === false &&
      'error' in err &&
      typeof err.error === 'object' &&
      err.error !== null &&
      'message' in err.error
    ) {
      title = (err.error as { message: string }).message;
    }
    // Handle string errors
    else if (typeof err === 'string') {
      title = err;
    }
    // Handle other cases (convert to string)
    else {
      title = 'An error occurred';
      console.error('Unknown error type:', err);
    }

    toast(title);
  }, []);

  return { toastError };
};
