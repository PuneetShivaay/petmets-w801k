
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

  // This effect handles page transitions and redirects once auth is resolved.
  useEffect(() => {
    // Hide the global page transition loader whenever navigation occurs.
    hidePageTransitionLoading();

    // Only perform redirects after the initial auth check is complete.
    if (!authIsLoading) {
      if (user && pathname === '/login') {
        // If logged in and on the login page, redirect to the dashboard.
        router.push('/');
      } else if (!user && pathname !== '/login') {
        // If not logged in and not on the login page, redirect to login.
        router.push('/login');
      }
    }
  }, [user, authIsLoading, pathname, router, hidePageTransitionLoading]);

  // The AuthProvider handles the initial loading screen.
  // AppLayout now assumes that if it renders, auth is resolved.

  // If the user is not logged in but is on the login page, show the login page.
  if (!user && pathname === '/login') {
    return <main className="h-full min-h-screen">{children}</main>;
  }

  // If the user is logged in, show the main application layout.
  if (user) {
    return <MainLayoutInternal>{children}</MainLayoutInternal>;
  }
  
  // Return null during the brief moment a redirect is occurring,
  // or if for some reason this component renders while auth is still loading.
  // The AuthProvider's loader should mostly prevent this from being visible.
  return null;
}
