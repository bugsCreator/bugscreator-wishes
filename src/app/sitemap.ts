import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.baseUrl;
  const now = new Date().toISOString();

  const routes = [
    '',
    // add more static routes or generate dynamically later
  ];

  return routes.map((path) => ({
    url: `${base}${path ? `/${path}` : ''}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.7,
  }));
}
