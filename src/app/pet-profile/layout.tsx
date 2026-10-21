import { pageMetadata, MetadataOnlyLayout } from '@/lib/seo';

export const metadata = pageMetadata('My Pet Profile', 'Manage your pet and owner profile.', '/pet-profile', { private: true });
export default MetadataOnlyLayout;
