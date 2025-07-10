
"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { MainLayoutInternal } from "./main-layout-internal";
import { useLoading } from '@/contexts/loading-context';
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";
import { useEffect } from 'react';

// This is a minimal loader component to be used ONLY during the initial auth check.
function InitialAuthLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading: authIsLoading } = useAuth();
  const { hideLoading: hidePageTransitionLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    // This hook now only handles hiding the loader after page navigations.
    hidePageTransitionLoading();
  }, [pathname, hidePageTransitionLoading]);
  
  // This is the new, stricter loading guard.
  // It uses the isLoading flag from our improved AuthProvider.
  // It prevents any child components from rendering until authentication is resolved.
  if (authIsLoading) {
    return <InitialAuthLoader />;
  }

  // Auth is resolved, now handle redirects.
  // If the user is logged in, but on the login page, redirect to home.
  if (user && pathname === '/login') {
    router.push('/');
    return <InitialAuthLoader />; // Show loader while redirecting
  }
  
  // If there's no user and they aren't on the login page, redirect to login.
  if (!user && pathname !== '/login') {
    router.push('/login');
    return <InitialAuthLoader />; // Show loader while redirecting
  }

  // If we are on the login page (and not logged in), render it outside the main layout.
  if (pathname === '/login') {
    return <main className="h-full min-h-screen">{children}</main>;
  }
  
  // For any other page, the user must be logged in. Render the full layout.
  // We can be confident `user` is not null here.
  return <MainLayoutInternal>{children}</MainLayoutInternal>;
}
