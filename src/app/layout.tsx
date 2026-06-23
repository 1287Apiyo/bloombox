import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AccessibilityAssist } from './components/AccessibilityAssist';
import { AuthProvider } from './components/AuthProvider';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bloombox.co.ke';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'BloomBox',
  title: {
    default: 'BloomBox - Monthly Period Care Subscriptions',
    template: '%s | BloomBox',
  },
  description: 'BloomBox delivers monthly period care subscriptions, comfort add-ons, cycle-aware reminders, donations, and partner care programs for women and girls in Kenya.',
  keywords: [
    'BloomBox',
    'period care Kenya',
    'menstrual care subscription',
    'monthly period box',
    'M-Pesa period products',
    'first period kit',
    'cycle tracking',
    'period care delivery',
  ],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/bloombox-icon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/bloombox-apple-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'BloomBox - Monthly Period Care Subscriptions',
    description: 'Monthly period care subscriptions, comfort add-ons, cycle-aware reminders, and community support delivered with care.',
    url: '/',
    siteName: 'BloomBox',
    type: 'website',
    images: [
      {
        url: '/bloombox-icon.png',
        width: 512,
        height: 512,
        alt: 'BloomBox logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BloomBox - Monthly Period Care Subscriptions',
    description: 'Monthly period care subscriptions, comfort add-ons, cycle-aware reminders, and community support delivered with care.',
    images: ['/bloombox-icon.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'BloomBox',
  url: siteUrl,
  image: `${siteUrl}/bloombox-icon.png`,
  description: 'Monthly period care subscriptions, comfort add-ons, donations, partner care programs, and cycle-aware reminders.',
  areaServed: 'Kenya',
  paymentAccepted: ['M-Pesa', 'M-Changa', 'Debit card', 'Credit card', 'PayPal'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'BloomBox subscription care plans',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Monthly period care subscriptions' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Custom monthly BloomBox subscription' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'First period gift kits' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Product', name: 'Donation care bundles' } },
    ],
  },
};

const preferenceScript = `
try {
  var root = document.documentElement;
  var savedFont = window.localStorage.getItem('bb-font-mode');
  var savedMotion = window.localStorage.getItem('bb-reduced-motion');
  if (savedFont === 'large' || savedFont === 'larger') root.dataset.bbFont = savedFont;
  if (savedMotion === 'true') root.dataset.bbMotion = 'reduced';
} catch (error) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: preferenceScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <AuthProvider>
          {children}
          <AccessibilityAssist />
        </AuthProvider>
      </body>
    </html>
  );
}
