
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { MainLayoutInternal } from "./main-layout-internal";
import { useLoading } from '@/contexts/loading-context';
import { useAuth } from "@/contexts/auth-context";
import { useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading: authIsLoading } = useAuth();
  const { hideLoading: hidePageTransitionLoading } = useLoading();
  const router = useRouter();

  // The AuthProvider now guarantees that authIsLoading will be false before this component renders.
  // The primary job of this useEffect is now just to handle routing logic.
  useEffect(() => {
    // This hook now only handles hiding the loader after page navigations.
    hidePageTransitionLoading();

    // Since authIsLoading is guaranteed to be false here, we can safely perform redirects.
    if (user && pathname === '/login') {
      router.push('/');
    } else if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, pathname, router, hidePageTransitionLoading]);

  // If we are on the login page (and not logged in), render it outside the main layout.
  // The check `!user` is safe because `authIsLoading` is false.
  if (!user && pathname === '/login') {
    return <main className="h-full min-h-screen">{children}</main>;
  }

  // If the user is logged in, show the main layout.
  // We can be confident `user` is not null here.
  if (user) {
    return <MainLayoutInternal>{children}</MainLayoutInternal>;
  }

  // If no other condition is met (e.g., routing is in progress, or on login page while still auth'd briefly),
  // return null to prevent rendering anything until the redirect completes.
  return null;
}
