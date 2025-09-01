import type { Metadata, Viewport } from 'next';
import { Mulish } from 'next/font/google';

import { Providers } from '@/core/context/providers';
import { Toaster } from '@/core/components/ui/Sonner';
import { ASSET_URL, BASE_URL } from '@/core/constants';

import '@/core/globals.css';

export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
  viewportFit: 'cover',
};

const mulishSans = Mulish({
  variable: '--font-mulish-sans',
  subsets: ['cyrillic', 'latin'],
});

export const metadata: Metadata = {
  title: 'Chat AI',
  applicationName: 'Chat AI',
  description: 'Beautiful AI companion',
  creator: 'Endeveron',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: 'Chat AI',
    description: `Chat AI - Beautiful AI companion`,
    siteName: 'Chat AI',
    type: 'website',
    url: '/',
    locale: 'en_US',
    images: [
      {
        url: `${BASE_URL}/images/og-image.png`,
        width: 1200,
        height: 630,
        alt: `OG Image`,
        type: 'image/png',
      },
      {
        url: `${BASE_URL}/images/og-image-square.png`,
        width: 1200,
        height: 1200,
        alt: `OG Image`,
        type: 'image/png',
      },
    ],
  },
  icons: {
    icon: {
      // url: 'https://chatai-sigma-three.vercel.app/favicon.ico',
      url: `${ASSET_URL}/icons/favicon.ico`,
      type: 'image/image/ico',
    },
  },

  // Additional meta tags for messaging apps and social platforms
  other: {
    // WhatsApp and general mobile
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Games',

    // Pinterest
    'pinterest-rich-pin': 'true',

    // Generic social media
    robots: 'index, follow',
    googlebot: 'index, follow',

    // For better link previews in messaging apps
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mulishSans.variable} antialiased`}>
        <Providers>
          <div className="layout">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
