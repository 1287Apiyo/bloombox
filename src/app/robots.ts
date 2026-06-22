import type { MetadataRoute } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bloombox.co.ke';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/checkout', '/orders', '/cycle'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
