'use client';

import { useCallback } from 'react';

export const useLocalStorage = (): {
  getItem: <T>(key: string) => T | null;
  setItem: <T>(key: string, item: T) => void;
  removeItem: (key: string) => void;
} => {
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

  const removeItem = useCallback((key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return { getItem, setItem, removeItem };
};
