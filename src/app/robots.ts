import type { MetadataRoute } from 'next';
import { SITE, PRIVATE_ROUTES } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: [...PRIVATE_ROUTES] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
