
"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MainLayoutInternal } from "./main-layout-internal"; // Adjusted import name

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    // For the login page, render children directly without the main layout
    return <main className="h-full min-h-screen">{children}</main>;
  }

  // For all other paths, use MainLayoutInternal which includes SidebarProvider
  return <MainLayoutInternal>{children}</MainLayoutInternal>;
}
