import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = siteConfig.baseUrl;
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
