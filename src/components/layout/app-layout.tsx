
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

  // This effect now only runs after authIsLoading is false.
  useEffect(() => {
    // Hide the page transition loader on navigation.
    hidePageTransitionLoading();

    // If auth is resolved (not loading), we can safely perform redirects.
    if (!authIsLoading) {
        if (user && pathname === '/login') {
            router.push('/');
        } else if (!user && pathname !== '/login') {
            router.push('/login');
        }
    }
  }, [user, authIsLoading, pathname, router, hidePageTransitionLoading]);

  // The AuthProvider now guarantees that this component and its children
  // will not render until authentication is resolved.
  // So, we no longer need a loading check here.

  // If auth is resolved and the user is not logged in, but on the login page.
  if (!user && pathname === '/login') {
    return <main className="h-full min-h-screen">{children}</main>;
  }

  // If auth is resolved and the user is logged in.
  if (user) {
    return <MainLayoutInternal>{children}</MainLayoutInternal>;
  }
  
  // This will be shown briefly during the redirect from a protected page to /login
  // or while auth state is being resolved initially.
  return null;
}
