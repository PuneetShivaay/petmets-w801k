
"use client"; 

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "@/components/icons";
import { navItems, type NavItem } from "@/config/nav";
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
import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { useToast } from "@/hooks/use-toast";


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
  const { user } = useAuth(); // Get auth user

  const handleLinkClick = () => {
    showLoading();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.href === '/login') return !user; // Show Login only if not logged in
    if (item.href === '/pet-profile') return !!user; // Show Pet Profile only if logged in
    // Add other conditional logic here if needed
    return true; // Show all other items
  });


  return (
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
  );
}

function HeaderContentInternal() {
    const pathname = usePathname();
    const { user } = useAuth();
    let title: string | undefined;
    
    if (user) {
        if (pathname.startsWith('/profile/')) {
            title = undefined; 
        } else if (pathname.startsWith('/chats/')) {
            title = undefined;
        } else {
             title = navItems.find(item => item.href === pathname)?.title || 'PetMets Dashboard';
        }
    } else if (pathname === '/login') {
      title = 'Login / Sign Up';
    }
    
    const renderTitle = (text?: string): React.ReactNode => {
        if (!text) return null;
        if (!text.includes('PetMets')) {
            return text;
        }
        const parts = text.split('PetMets');
        return (
            <>
                {parts[0]}
                <span className="font-semibold">
                    <span className="text-primary">Pet</span>
                    <span className="text-accent">Mets</span>
                </span>
                {parts[1]}
            </>
        );
      };

    return (
        <div className="flex items-center gap-4">
            <SidebarTrigger />
             <h1 className="hidden font-headline text-xl font-semibold truncate sm:block">
                {renderTitle(title)}
            </h1>
        </div>
    );
}

function LogoutButtonInternal() {
  const { isMobile, setOpenMobile } = useSidebar();
  const { showLoading } = useLoading(); 
  const { userSignOut, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

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

  if (!user) return null; // Don't show logout button if no user

  return (
    <SidebarMenuButton
        className="w-full justify-start"
        onClick={handleLogoutClick}
        tooltip="Logout"
    >
        <LogOut className="mr-2 h-5 w-5" />
        <span className="text-sidebar-foreground">Logout</span>
    </SidebarMenuButton>
  );
}

function MainLayoutChild({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isChatPage = pathname.startsWith('/chats/');
  const { isMobile } = useSidebar();

  const showHeader = isMobile ? !isChatPage : true;

  return (
    <>
      <Sidebar className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <AppLogoLinkInternal />
        </SidebarHeader>
        <SidebarContent>
          <ScrollArea className="flex-grow">
            <SidebarNavigationInternal />
          </ScrollArea>
        </SidebarContent>
        {user && (
          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <LogoutButtonInternal />
          </SidebarFooter>
        )}
      </Sidebar>
      <SidebarInset className="flex flex-col">
        {showHeader && (
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4">
            <HeaderContentInternal />
          </header>
        )}
        <main
          className={cn(
            "flex-1 overflow-auto",
            isChatPage && isMobile ? "p-0" : "p-2 sm:p-4 md:p-6"
          )}
        >
          {children}
        </main>
      </SidebarInset>
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
