
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MainLayoutInternal } from "./main-layout-internal";
import { useLoading } from '@/contexts/loading-context';
import { useEffect } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hideLoading } = useLoading();

  useEffect(() => {
    hideLoading();
  }, [pathname, hideLoading]);

  if (pathname === '/login') {
    return <main className="h-full min-h-screen">{children}</main>;
  }

  return <MainLayoutInternal>{children}</MainLayoutInternal>;
}
