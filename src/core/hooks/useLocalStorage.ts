'use client';

import { useCallback } from 'react';

export function useLocalStorage(): [
  getItem: <T>(key: string) => T | null,
  setItem: <T>(key: string, item: T) => void
] {
  const getItem = useCallback<<T>(key: string) => T | null>((key) => {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  const setItem = useCallback((key: string, item: unknown) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(error);
    }
  }, []);

  return [getItem, setItem];
}
