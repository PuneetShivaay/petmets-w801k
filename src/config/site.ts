/** Site-wide SEO settings. Set NEXT_PUBLIC_SITE_URL in apphosting.yaml / .env for production. */
export const SITE = {
  name: 'PetMets',
  tagline: 'Your Pet Companion App',
  description:
    'Find trusted pet walkers, groomers, trainers, boarding and photographers near you. Match your pet, adopt, and keep health records in one place.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
} as const;

/** Public, indexable routes (used by sitemap.ts). */
export const PUBLIC_ROUTES = [
  '/',
  '/providers',
  '/walkers',
  '/grooming',
  '/training',
  '/boarding',
  '/photography',
  '/playzone',
  '/adoption',
  '/match',
] as const;

/** Private / user-specific routes — never indexed (used by robots.ts). */
export const PRIVATE_ROUTES = [
  '/login',
  '/chats',
  '/bookings',
  '/records',
  '/pet-profile',
  '/business-profile',
  '/profile',
  '/coming-soon',
] as const;
