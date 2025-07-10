
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
  
  // This is the new, stricter loading guard.
  // It uses the isLoading flag from our improved AuthProvider.
  if (authIsLoading) {
    return <GlobalLoader />;
  }

  // Auth is resolved, now handle redirects.
  if (user && pathname === '/login') {
    // We don't need to show a loader here, because the redirect will be very fast
    // and the AuthProvider already handled the initial load.
    router.push('/');
    return <GlobalLoader />; // Show loader while redirecting
  }
  
  if (!user && pathname !== '/login') {
    router.push('/login');
    return <GlobalLoader />; // Show loader while redirecting
  }

  // If we are on the login page, render it outside the main layout.
  if (pathname === '/login') {
    return <main className="h-full min-h-screen">{children}</main>;
  }
  
  // For any other page, the user must be logged in. Render the full layout.
  return <MainLayoutInternal>{children}</MainLayoutInternal>;
}
