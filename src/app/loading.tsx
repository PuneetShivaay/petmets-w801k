import { PageSkeleton } from "@/components/design";

/** Fallback skeleton for any route without its own loading.tsx (incl. home). */
export default function Loading() {
  return <PageSkeleton variant="grid" />;
}
