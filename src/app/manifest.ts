import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chat AI',
    short_name: 'Chat AI',
    description: 'Your beautiful AI companion',
    start_url: '/',
    display: 'standalone',
    background_color: '#B51AC3',
    theme_color: '#B51AC3',
    icons: [
      {
        src: '/icons/favicon.ico',
        sizes: 'any',
        type: 'image/ico',
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icons/icon-256x256.png',
        sizes: '256x256',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/android-icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/icons/icon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/icons/icon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
  };
}
