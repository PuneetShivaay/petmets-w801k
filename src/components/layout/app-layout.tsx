
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { MainLayoutInternal } from "./main-layout-internal";
import { useLoading } from '@/contexts/loading-context';
import { useAuth } from "@/contexts/auth-context";
import { GlobalLoader } from "@/components/global-loader";
import { useEffect } from 'react';


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading: authIsLoading } = useAuth();
  const { hideLoading: hidePageTransitionLoading, showLoading: showPageTransitionLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    // Hide page transition loader when pathname changes (navigation completes)
    hidePageTransitionLoading();
  }, [pathname, hidePageTransitionLoading]);

  // Auth is now handled by the AuthProvider, which shows a loader and prevents this component
  // from rendering until auth is resolved. This makes the logic here much cleaner.
  // We no longer need to check `authIsLoading`.

  useEffect(() => {
    // Perform redirects once auth state is known.
    if (user && pathname === '/login') {
      showPageTransitionLoading();
      router.push('/');
    } else if (!user && pathname !== '/login') {
      showPageTransitionLoading();
      router.push('/login');
    }
  }, [pathname, user, router, showPageTransitionLoading]);

  // If we are on the login page and the user is not logged in.
  if (pathname === '/login') {
    // If user *is* logged in, the useEffect above will redirect them.
    // In the meantime, show a loader to prevent the login form from flashing.
    if (user) return <GlobalLoader />;
    return <main className="h-full min-h-screen">{children}</main>;
  }
  
  // If user is not logged in and trying to access a protected route,
  // the useEffect will redirect. Show a loader during this process.
  if (!user) {
     return <GlobalLoader />;
  }

  // If we've passed all checks, the user is logged in and not on the login page.
  return <MainLayoutInternal>{children}</MainLayoutInternal>;
}
