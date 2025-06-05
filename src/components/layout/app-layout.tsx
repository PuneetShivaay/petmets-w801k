
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

  useEffect(() => {
    if (!authIsLoading) { // Only perform redirects once auth state is resolved
      if (user && pathname === '/login') {
        showPageTransitionLoading();
        router.push('/');
      } else if (!user && pathname !== '/login') {
        showPageTransitionLoading();
        router.push('/login');
      }
    }
  }, [pathname, user, authIsLoading, router, showPageTransitionLoading]);

  if (authIsLoading) {
    // Show a loader full screen while determining auth state
    // This uses the GlobalLoader, which is fine.
    return <GlobalLoader />;
  }

  // If we are on the login page and the user is not logged in (authIsLoading is false)
  if (pathname === '/login' && !user) {
    return <main className="h-full min-h-screen">{children}</main>;
  }
  
  // If user is not logged in and trying to access a protected route
  // (and not already on /login, and auth check is complete)
  // This case should be caught by the useEffect redirect, but as a fallback:
  if (!user && pathname !== '/login') {
     return <GlobalLoader />; // Show loader, useEffect will redirect
  }

  // If user is logged in, or if it's the login page and the user is not yet known (but auth not loading)
  // then MainLayoutInternal will be shown (or login page children if !user && pathname === '/login')
  return <MainLayoutInternal>{children}</MainLayoutInternal>;
}
