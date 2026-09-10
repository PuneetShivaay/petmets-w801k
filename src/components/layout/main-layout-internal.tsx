
"use client"; 

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  useSidebar,        
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LogOut } from "lucide-react";
import { useLoading } from "@/contexts/loading-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "./bottom-nav";

function MainLayoutChild({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const { showLoading } = useLoading();
  const { user, userRole, userSignOut } = useAuth();
  const { toast } = useToast();

  const handleLinkClick = () => {
    showLoading();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogoutClick = async () => {
    showLoading();
    try {
        await userSignOut();
        if (isMobile) {
          setOpenMobile(false);
        }
    } catch (error) {
        console.error("Logout failed", error);
        toast({ title: "Logout Failed", description: (error as Error).message, variant: "destructive" });
    }
  };

  const filteredNavItems = navItems.filter(item => {
    if (!user) return item.href === '/login';
    if (item.href === '/login') return false;
    
    // Filter based on roles
    if (item.roles && userRole) {
      return item.roles.includes(userRole);
    }
    
    return true; 
  });
  
  const defaultTitle = navItems.find(item => item.href === pathname)?.title;
  const isDynamicPage = pathname.startsWith('/chats/') || pathname.startsWith('/profile/');
  
  // Header is hidden on mobile if it's the dashboard (custom mobile header there)
  // or dynamic pages.
  const isDashboard = pathname === '/';
  const headerIsVisible = !isDynamicPage && (!isMobile || !isDashboard);

  return (
    <>
      <Sidebar className="border-r border-sidebar-border hidden md:flex">
        <SidebarHeader className="p-4">
          <Link href="/" onClick={handleLinkClick} className="block">
            <AppLogo />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="flex-grow">
            <SidebarMenu className="p-2 pt-0 sm:p-4 sm:pt-0">
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild={item.href.startsWith("/")}
                      className={cn(
                        "w-full justify-start",
                        pathname === item.href && "bg-sidebar-primary text-sidebar-primary-foreground",
                        pathname !== item.href && "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
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
                        <span className="text-sidebar-foreground">{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        {user && (
          <SidebarFooter className="p-4 border-t border-sidebar-border">
             <SidebarMenuButton
                className="w-full justify-start"
                onClick={handleLogoutClick}
                tooltip="Logout"
            >
                <LogOut className="mr-2 h-5 w-5" />
                <span className="text-sidebar-foreground">Logout</span>
            </SidebarMenuButton>
          </SidebarFooter>
        )}
      </Sidebar>
      <div className="flex-1 flex flex-col">
        {headerIsVisible && (
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4">
                <div className="flex w-full items-center gap-2">
                    <SidebarTrigger />
                    <h1 className="font-headline text-lg sm:text-xl font-semibold truncate">
                        {defaultTitle}
                    </h1>
                </div>
            </header>
          )}
        <main className={cn("flex-1 overflow-auto", isDynamicPage && "h-screen", "pb-20 md:pb-0")}>
          <div className={cn(!isDynamicPage && !isDashboard && "p-4 sm:p-6")}>
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </>
  );
}

export function MainLayoutInternal({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen>
      <MainLayoutChild>{children}</MainLayoutChild>
    </SidebarProvider>
  );
}
