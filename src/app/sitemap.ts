import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bloombox.co.ke';

const routes = [
  '',
  '/shop',
  '/subscriptions',
  '/donate',
  '/gifting',
  '/cycle',
  '/partner',
  '/about',
  '/blog',
  '/faqs',
  '/privacy',
  '/terms',
  '/signup',
  '/login',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' || route === '/subscriptions' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/subscriptions' ? 0.95 : route === '/shop' || route === '/donate' ? 0.8 : 0.7,
  }));
}
