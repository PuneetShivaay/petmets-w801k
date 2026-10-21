import { pageMetadata, MetadataOnlyLayout } from '@/lib/seo';

export const metadata = pageMetadata('My Bookings', 'Your upcoming and past pet service bookings.', '/bookings', { private: true });
export default MetadataOnlyLayout;
