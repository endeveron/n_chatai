'use client';

import { SessionProvider } from 'next-auth/react';

import { ThemeProvider } from '@/core/components/ui/ThemeProvider';
import { LangProvider } from '@/core/context/lang';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
    >
      <SessionProvider>
        <LangProvider>{children}</LangProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
