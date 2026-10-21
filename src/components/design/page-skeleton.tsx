import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { layout } from "@/theme/variants";

/**
 * Instant placeholder shown by route `loading.tsx` files while a page's JS loads.
 * Data-level skeletons inside each page take over once the page mounts.
 */
export function PageSkeleton({
  variant = "grid",
  cards = 10,
}: {
  /** grid: card listings · list: rows (chats, bookings) · detail: profile/form pages */
  variant?: "grid" | "list" | "detail";
  cards?: number;
}) {
  return (
    <div className={cn(layout.page, "animate-in fade-in duration-300")} aria-busy="true" aria-label="Loading">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <Skeleton className="h-4 w-80 max-w-full rounded-lg" />
      </div>

      {variant === "grid" && (
        <div className={layout.cardGrid}>
          {Array.from({ length: cards }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-card border border-border/60 bg-card shadow-card">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      )}

      {variant === "list" && (
        <div className="divide-y divide-border overflow-hidden rounded-card border border-border/60 bg-card shadow-card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      )}

      {variant === "detail" && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-4 rounded-card border border-border/60 bg-card p-6 shadow-card">
            <Skeleton className="mx-auto h-28 w-28 rounded-full" />
            <Skeleton className="mx-auto h-5 w-1/2" />
            <Skeleton className="mx-auto h-3 w-1/3" />
          </div>
          <div className="space-y-4 rounded-card border border-border/60 bg-card p-6 shadow-card md:col-span-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
