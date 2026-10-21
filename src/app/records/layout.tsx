import { pageMetadata, MetadataOnlyLayout } from '@/lib/seo';

export const metadata = pageMetadata('Health Records', "Your pet's secure health document vault.", '/records', { private: true });
export default MetadataOnlyLayout;
