
"use client"; 

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppLogo } from "@/components/icons";
import { navItems } from "@/config/nav";
import { cn } from "@/lib/utils";
import {
  SidebarProvider, 
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,    
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,        
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from "lucide-react";
import { useLoading } from "@/contexts/loading-context";

function AppLogoLinkInternal() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { showLoading } = useLoading();
  const handleLogoClick = () => {
    showLoading();
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

function SidebarNavigationInternal() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { showLoading } = useLoading();

  const handleLinkClick = () => {
    showLoading();
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
              onClick={item.href.startsWith("/") ? handleLinkClick : undefined}
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
              onClick={handleLinkClick}
            >
              <a>
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

function HeaderContentInternal() {
    const pathname = usePathname();
    return (
        <>
            <div className="md:hidden">
                 <SidebarTrigger /> 
            </div>
            <h1 className="font-headline text-xl font-semibold flex-1">
                {navItems.find(item => item.href === pathname)?.title || 'PetMets'}
            </h1>
        </>
    );
}

function LogoutButtonInternal() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { showLoading, hideLoading } = useLoading(); 
  const handleLogoutClick = () => {
    showLoading();
    console.log("Logout clicked");
    // Simulate action and potential navigation or state change
    // For a real app, this would involve an API call and likely a redirect.
    // If it's just a client-side state change without navigation, hideLoading() should be called manually.
    // If it navigates, the useEffect in AppLayout will handle hideLoading.
    setTimeout(() => {
        if (isMobile) {
          setOpenMobile(false);
        }
        // Example: if no navigation, hide manually. If navigation, this might be redundant.
        // hideLoading(); // Or let path change handle it.
        // router.push('/login'); // If using Next Router for navigation
    }, 500); // Simulate delay
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

export function MainLayoutInternal({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen> 
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
