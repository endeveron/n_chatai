import type { Metadata, Viewport } from 'next';
import { Mulish } from 'next/font/google';

import { Toaster } from '@/core/components/ui/Sonner';
import { APP_NAME, BASE_URL } from '@/core/constants';
import { Providers } from '@/core/context/providers';

import '@/core/globals.css';

export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f9fafa' },
    { media: '(prefers-color-scheme: dark)', color: '#17181c' },
  ],
};

const mulishSans = Mulish({
  variable: '--font-mulish-sans',
  subsets: ['cyrillic', 'latin'],
});

export const metadata: Metadata = {
  title: `${APP_NAME} – Your hot chat mate`,
  applicationName: APP_NAME,
  description: `Enter a world of fantasy with Chat AI. Pick your perfect sultry companion for flirty, emotional, or fully NSFW chats — all just a click away.`,
  creator: 'Endeveron',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: `${APP_NAME} – Your hot chat mate`,
    description: `Enter a world of fantasy with Chat AI. Pick your perfect sultry companion for flirty, emotional, or fully NSFW chats — all just a click away.`,
    siteName: APP_NAME,
    type: 'website',
    url: '/',
    locale: 'en_US',
    images: [
      {
        url: `${BASE_URL}/images/open-graph/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `OG Image`,
        type: 'image/jpg',
      },
      {
        url: `${BASE_URL}/images/open-graph/og-image-square.jpg`,
        width: 1200,
        height: 1200,
        alt: `OG Image`,
        type: 'image/jpg',
      },
    ],
  },
  icons: {
    icon: {
      url: `${BASE_URL}/images/icons/favicon.ico`,
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
