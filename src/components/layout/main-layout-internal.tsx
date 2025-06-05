
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
    <SidebarMenu className="p-4 pt-0">
      {filteredNavItems.map((item) => (
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
    </SidebarMenu>
  );
}

function HeaderContentInternal() {
    const pathname = usePathname();
    const { user } = useAuth();
    let title = 'PetMets';
    if (user) {
      title = navItems.find(item => item.href === pathname)?.title || 'PetMets Dashboard';
    } else if (pathname === '/login') {
      title = 'Login / Sign Up';
    }
    
    return (
        <>
            <div className="md:hidden">
                 <SidebarTrigger /> 
            </div>
            <h1 className="font-headline text-xl font-semibold flex-1">
                {title}
            </h1>
        </>
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
        // The AuthProvider and AppLayout useEffect will handle redirect to /login
        // router.push('/login'); // This might be redundant if AppLayout handles it
        if (isMobile) {
          setOpenMobile(false);
        }
    } catch (error) {
        console.error("Logout failed", error);
        toast({ title: "Logout Failed", description: (error as Error).message, variant: "destructive" });
        // showLoading will be hidden by AppLayout path change or manually if needed
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
        <span>Logout</span>
    </SidebarMenuButton>
  );
}

export function MainLayoutInternal({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // Used to decide whether to show logout

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
        {user && ( // Only show footer with logout if user is logged in
          <SidebarFooter className="p-4 border-t border-sidebar-border">
              <LogoutButtonInternal />
          </SidebarFooter>
        )}
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
