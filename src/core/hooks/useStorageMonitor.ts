'use client';

import { useEffect } from 'react';

// Static keys
const safeKeys = ['__nextjs-dev-tools-position', 'lang-code', 'theme'];

// Dynamic key patterns
const safeKeyPatterns = [
  /^heat-level(_.*)?$/, // Matches 'heat-level' and 'heat-level_*'
  /^chat-media-min(_.*)?$/, // Matches 'chat-media-min' and 'chat-media-min_*'
];

const suspiciousPatterns = [
  /korea/i,
  /dialog/i,
  /pro/i,
  /token/i,
  /auth/i,
  /session/i,
  /script/i,
  /eval/i,
  /function/i,
  /base64/i,
];

export function useStorageMonitor() {
  const isSafeKey = (key: string) =>
    safeKeys.includes(key) ||
    safeKeyPatterns.some((pattern) => pattern.test(key));

  useEffect(() => {
    // Only in development
    if (process.env.NODE_ENV !== 'development') return;

    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = (key: string, value: string) => {
      if (!isSafeKey(key)) {
        console.group(`[LS Monitor] localStorage.setItem`);
        console.log('Key:', key);
        console.log('Value:', value);
        console.log('Stack:', new Error().stack);
        console.groupEnd();

        // Check for suspicious patterns
        const isSuspicious = suspiciousPatterns.some(
          (pattern) => pattern.test(key) || pattern.test(value)
        );

        if (isSuspicious) {
          console.warn('[LS Monitor] SUSPICIOUS localStorage activity!', {
            key,
            value,
          });
        }
      }

      return originalSetItem.call(localStorage, key, value);
    };

    localStorage.removeItem = (key: string) => {
      if (!isSafeKey(key)) {
        console.group(`[LS Monitor] localStorage.removeItem`);
        console.log('Key:', key);
        console.groupEnd();
      }

      return originalRemoveItem.call(localStorage, key);
    };

    // Cleanup
    return () => {
      localStorage.setItem = originalSetItem;
    };
  }, []);
}
