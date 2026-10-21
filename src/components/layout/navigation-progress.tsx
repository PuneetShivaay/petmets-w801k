"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Instant navigation feedback (no full-screen blocking):
 *  - A thin top progress bar starts the moment any internal link is clicked.
 *  - `pendingHref` lets nav components highlight the clicked tab immediately
 *    (optimistic active state) before the new route has rendered.
 * Completes automatically when the pathname changes.
 */

type NavigationProgressContextValue = {
  /** Path the user just clicked, until the route actually changes. */
  pendingHref: string | null;
  /** Start feedback manually (use before `router.push`). */
  start: (href: string) => void;
};

const NavigationProgressContext = React.createContext<NavigationProgressContextValue>({
  pendingHref: null,
  start: () => {},
});

export const useNavigationProgress = () => React.useContext(NavigationProgressContext);

/** Safety net: never leave the bar stuck if a navigation is cancelled or fails. */
const MAX_DURATION_MS = 10_000;

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const trickleRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const safetyRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (trickleRef.current) clearInterval(trickleRef.current);
    if (safetyRef.current) clearTimeout(safetyRef.current);
    trickleRef.current = null;
    safetyRef.current = null;
  };

  const start = React.useCallback((href: string) => {
    const path = href.split(/[?#]/)[0] || "/";
    if (path === window.location.pathname) return; // same page → nothing to load

    clearTimers();
    setPendingHref(path);
    setVisible(true);
    setProgress(10);
    // Ease towards 85% while waiting; the last stretch completes on route change.
    trickleRef.current = setInterval(() => {
      setProgress((p) => (p < 85 ? p + (85 - p) * 0.12 : p));
    }, 180);
    safetyRef.current = setTimeout(() => {
      clearTimers();
      setPendingHref(null);
      setVisible(false);
      setProgress(0);
    }, MAX_DURATION_MS);
  }, []);

  // Route changed → finish the bar and clear the optimistic state.
  React.useEffect(() => {
    clearTimers();
    setPendingHref(null);
    setProgress((p) => (p > 0 ? 100 : 0));
    const hide = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(hide);
  }, [pathname]);

  // Catch every internal <a>/<Link> click app-wide (cards, sidebar, buttons-as-links…).
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      start(url.pathname);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  React.useEffect(() => clearTimers, []);

  const value = React.useMemo(() => ({ pendingHref, start }), [pendingHref, start]);

  return (
    <NavigationProgressContext.Provider value={value}>
      <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-[3px]">
        <div
          className={cn(
            "h-full rounded-r-pill bg-primary shadow-glow transition-[width,opacity] duration-300 ease-out",
            visible ? "opacity-100" : "opacity-0"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      {children}
    </NavigationProgressContext.Provider>
  );
}
