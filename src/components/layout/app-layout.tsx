"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/icons";
import { navItems, type NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar className="border-r">
        <SidebarHeader className="p-4">
          <Link href="/" className="block">
            <AppLogo />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="flex-grow">
            <SidebarMenu className="p-4 pt-0">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild={item.href.startsWith("/")} // Use asChild for internal links
                      className={cn(
                        "w-full justify-start",
                        pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground",
                        item.disabled && "cursor-not-allowed opacity-80"
                      )}
                      disabled={item.disabled}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      tooltip={item.title}
                    >
                      <a>
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>{item.title}</span>
                        {item.label && (
                          <span className="ml-auto text-xs text-muted-foreground">
                            {item.label}
                          </span>
                        )}
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <div className="md:hidden">
                 <SidebarTrigger />
            </div>
            <h1 className="font-headline text-xl font-semibold flex-1">
                {navItems.find(item => item.href === pathname)?.title || 'PetMets'}
            </h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
