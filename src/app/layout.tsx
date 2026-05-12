// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from './components/AuthProvider';

export const metadata: Metadata = {
  title: {
    default: 'BloomBox - Celebrating Womanhood',
    template: '%s | BloomBox',
  },
  description: 'A platform designed to gift women on the arrival of their first period and provide monthly care packages.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/bloombox-icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/bloombox-apple-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'BloomBox - Celebrating Womanhood',
    description: 'Period care, comfort essentials, and thoughtful gifts delivered with care.',
    images: [
      {
        url: '/bloombox-icon.png',
        width: 512,
        height: 512,
        alt: 'BloomBox logo',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
