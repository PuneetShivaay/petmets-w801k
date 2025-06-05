
"use client"; // This entire module is client-side

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/icons";
import { navItems } from "@/config/nav";
import { cn } from "@/lib/utils";
import {
  SidebarProvider, // Provider
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,    // Consumes context
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,        // Hook to consume context
} from "@/components/ui/sidebar";
// Button is a general UI component, not necessarily context-dependent
import { Button } from "@/components/ui/button"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from "lucide-react";

// Helper component for the App Logo Link - Consumes useSidebar
function AppLogoLinkInternal() {
  const { isMobile, setOpenMobile } = useSidebar();
  const handleLogoClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  return (
    <Link href="/" onClick={handleLogoClick} className="block">
      <AppLogo />
    </Link>
  );
}

// Helper component for rendering sidebar navigation items - Consumes useSidebar
function SidebarNavigationInternal() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const mainNavItems = navItems.filter(item => item.href !== '/logout' && item.href !== '/login');
  const loginNavItem = navItems.find(item => item.href === '/login');

  return (
    <SidebarMenu className="p-4 pt-0">
      {mainNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild={item.href.startsWith("/")}
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
              <a onClick={handleMenuItemClick}>
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
      {loginNavItem && (
         <SidebarMenuItem key={loginNavItem.href} className="mt-auto pt-4 border-t border-sidebar-border">
          <Link href={loginNavItem.href} passHref legacyBehavior>
            <SidebarMenuButton
              asChild
              className={cn(
                "w-full justify-start",
                pathname === loginNavItem.href && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
              tooltip={loginNavItem.title}
            >
              <a onClick={handleMenuItemClick}>
                <loginNavItem.icon className="mr-2 h-5 w-5" />
                <span>{loginNavItem.title}</span>
              </a>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}

// Header specific content - Consumes useSidebar via SidebarTrigger
function HeaderContentInternal() {
    const pathname = usePathname();
    return (
        <>
            <div className="md:hidden">
                 <SidebarTrigger /> {/* SidebarTrigger calls useSidebar */}
            </div>
            <h1 className="font-headline text-xl font-semibold flex-1">
                {navItems.find(item => item.href === pathname)?.title || 'PetMets'}
            </h1>
        </>
    );
}

// Component for the logout button logic - Consumes useSidebar
function LogoutButtonInternal() {
  const { isMobile, setOpenMobile } = useSidebar();
  const handleLogoutClick = () => {
    console.log("Logout clicked");
    if (isMobile) {
      setOpenMobile(false);
    }
    // router.push('/login'); // Example redirect
  };

  return (
    <SidebarMenuButton
        className="w-full justify-start"
        onClick={handleLogoutClick}
        tooltip="Logout"
    >
        <LogOut className="mr-2 h-5 w-5" />
        <span>Logout</span>
    </SidebarMenuButton>
  );
}

// This component sets up the SidebarProvider and renders the actual layout
export function MainLayoutInternal({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen> {/* PROVIDER IS HERE, at the root of this self-contained layout module */}
      <Sidebar className="border-r">
        <SidebarHeader className="p-4">
          <AppLogoLinkInternal />
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="flex-grow">
            <SidebarNavigationInternal />
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
            <LogoutButtonInternal />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <HeaderContentInternal />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
