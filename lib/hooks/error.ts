'use client';

import { useToast } from '@/components/ui/use-toast';

export const useErrorHandler = () => {
  const toast = useToast();

  /**
   * Displays an error toast with a title and description based on the provided error object.
   * @param {any} err an object that represents an error. The code is specifically accessing the `message` property of the `err` object. If the `message` property exists and is truthy, it will be used as the description in the toast notification.
   */
  const toastError = (err: any) => {
    if (!err) return;
    let title = 'Oops! ';

    if (err?.message) {
      // Handle a default error object
      title += err.message;
    } else if (err?.success === false && err?.error?.message) {
      // Handle an error from server action
      title += err.error.message;
    } else if (typeof err === 'string') {
      // Handle a custom error message
      title += err;
    } else {
      title += 'An error occured';
    }

    toast.toast({
      variant: 'destructive',
      title,
      // description,
      // duration: 5000,
    });
  };

  return { toastError };
};
