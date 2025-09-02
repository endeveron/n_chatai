'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useClipboard = (timeout: number = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (typeof window === 'undefined' || !navigator?.clipboard) {
        toast('Clipboard API is not available');
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (error) {
        console.error('Failed to copy:', error);
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { copy, copied };
};
