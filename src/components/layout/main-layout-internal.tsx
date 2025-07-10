
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
  useSidebar,        
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, ArrowLeft, User } from "lucide-react";
import { useLoading } from "@/contexts/loading-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface OtherUser {
    id: string;
    avatar: string;
    dataAiHint: string;
    name: string;
}

function MainLayoutChild({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const { showLoading } = useLoading();
  const { user, userSignOut } = useAuth();
  const { toast } = useToast();

  const [pageTitle, setPageTitle] = React.useState<string | undefined>(undefined);
  const [otherUser, setOtherUser] = React.useState<OtherUser | null>(null);

  const handleLinkClick = () => {
    showLoading();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleGoBack = () => {
    showLoading();
    router.back();
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
    if (item.href === '/login') return !user;
    if (item.href === '/pet-profile') return !!user;
    return true; 
  });
  
  const defaultTitle = navItems.find(item => item.href === pathname)?.title;
  
  const isDynamicPage = pathname.startsWith('/chats/') || pathname.startsWith('/profile/');
  const headerIsVisible = !isDynamicPage;

  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
        // @ts-ignore
      return React.cloneElement(child, { setPageTitle, setOtherUser });
    }
    return child;
  });

  return (
    <>
      <Sidebar className="border-r border-sidebar-border">
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
        {headerIsVisible ? (
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4">
                <div className="flex w-full items-center gap-2">
                    <SidebarTrigger />
                    <h1 className="font-headline text-lg sm:text-xl font-semibold truncate">
                        {pageTitle || defaultTitle}
                    </h1>
                </div>
            </header>
          ) : (
            isDynamicPage && (
              <header className="sticky top-0 z-10 flex h-16 items-center justify-start gap-3 border-b bg-background px-4">
                  <SidebarTrigger className="sm:hidden" />
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleGoBack}>
                      <ArrowLeft className="h-5 w-5" />
                  </Button>
                   {otherUser && (
                     <div className="flex items-center gap-3 overflow-hidden">
                       <Avatar className="h-9 w-9">
                           <AvatarImage src={otherUser.avatar} data-ai-hint={otherUser.dataAiHint} />
                           <AvatarFallback><User /></AvatarFallback>
                       </Avatar>
                       <span className="font-semibold text-lg truncate">{otherUser.name}</span>
                     </div>
                   )}
              </header>
            )
          )}
        <main className={cn("flex-1 overflow-auto", isDynamicPage && "h-screen")}>
          <div className="p-4 sm:p-6">
            {childrenWithProps}
          </div>
        </main>
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
