import type { MetadataRoute } from 'next';
import { SITE } from '@/config/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE.name} – ${SITE.tagline}`,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#F0F4F7',
    theme_color: '#FF642F',
    icons: [{ src: '/images/logo.png', sizes: 'any', type: 'image/png' }],
  };
}
