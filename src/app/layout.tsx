import type { Metadata, Viewport } from 'next';
import { Mulish } from 'next/font/google';

import { Providers } from '@/core/context/providers';
import { Toaster } from '@/core/components/ui/Sonner';

import '@/core/globals.css';

export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
  viewportFit: 'cover',
};

const interSans = Mulish({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Chat AI',
  description: 'Your AI campanion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${interSans.variable} antialiased`}>
        <Providers>
          <div className="layout">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
