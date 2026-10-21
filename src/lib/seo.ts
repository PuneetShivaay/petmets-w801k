import type { Metadata } from 'next';

/** Builds per-route metadata for route `layout.tsx` files (pages are client components). */
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  opts: { private?: boolean } = {}
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path },
    twitter: { title, description },
    ...(opts.private && { robots: { index: false, follow: false } }),
  };
}

/** Pass-through layout used by route segments that only add metadata. */
export function MetadataOnlyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
