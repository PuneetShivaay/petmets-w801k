
"use client"; 

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "@/components/icons";
import { navItems, quickLinks } from "@/config/nav";
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
import { LogOut, Bell, Search, MapPin, User, ChevronDown } from "lucide-react";
import { useLoading } from "@/contexts/loading-context";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { BottomNav } from "./bottom-nav";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Image from "next/image";

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
    if (item.roles && userRole) {
      return item.roles.includes(userRole);
    }
    return true; 
  });

  const isDynamicPage = pathname.startsWith('/chats/') || pathname.startsWith('/profile/');
  const isDashboard = pathname === '/';
  const headerIsVisible = !isDynamicPage;

  return (
    <>
      <Sidebar className="border-r border-sidebar-border hidden md:flex bg-white">
        <SidebarHeader className="p-8">
          <Link href="/" onClick={handleLinkClick} className="block">
            <AppLogo />
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-4">
          <ScrollArea className="flex-grow">
            <SidebarMenu className="gap-1">
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild={item.href.startsWith("/")}
                      isActive={pathname === item.href}
                      className={cn(
                        "w-full justify-start rounded-xl px-4 py-6 transition-all",
                        pathname === item.href ? "bg-primary text-white hover:bg-primary/90 shadow-md" : "text-slate-600 hover:bg-slate-50"
                      )}
                      onClick={item.href.startsWith("/") ? handleLinkClick : undefined}
                    >
                      <div className="flex items-center w-full">
                        <item.icon className={cn("mr-4 h-5 w-5", pathname === item.href ? "text-white" : "text-slate-400")} />
                        <span className="font-bold text-sm tracking-tight">{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto bg-primary text-white border-none h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}

              <div className="mt-8 px-4 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Links</span>
              </div>

              {quickLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="w-full justify-start rounded-xl px-4 py-2 text-slate-500 hover:bg-slate-50"
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-4 h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-8 mt-auto">
            <div className="space-y-8">
              <div className="relative p-6 rounded-[2rem] bg-slate-50/80 overflow-hidden border border-slate-100">
                <div className="relative z-10 text-[11px] font-bold text-slate-600 italic leading-snug">
                  Happy Pets<br/>Happy People<br/>Better World 🧡
                </div>
                <Image 
                  src="https://picsum.photos/seed/footer-dog/100/100" 
                  alt="Pet" 
                  width={80} 
                  height={80} 
                  className="absolute -bottom-2 -left-4 opacity-40 rotate-12"
                />
              </div>
              {user && (
                <SidebarMenuButton
                  className="w-full justify-start text-slate-400 hover:text-destructive px-4"
                  onClick={handleLogoutClick}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-xs font-bold">Logout</span>
                </SidebarMenuButton>
              )}
            </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        {/* Global Desktop Header */}
        {!isMobile && (
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-6 border-b bg-white px-10 shadow-sm">
            <div className="flex flex-1 items-center max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="w-full pl-12 bg-slate-50 border-none rounded-xl h-11 text-xs focus-visible:ring-1 focus-visible:ring-primary/20" 
                placeholder="Search for services, products, vets, trainers, or anything..."
              />
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold">Bengaluru</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>

              <div className="relative cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-all">
                <Bell className="h-6 w-6 text-slate-600" />
                <Badge className="absolute top-1 right-1 h-4 w-4 bg-primary text-white border-2 border-white flex items-center justify-center p-0 text-[8px] rounded-full">
                  3
                </Badge>
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                <Avatar className="h-10 w-10 border-2 border-white shadow-md ring-1 ring-slate-100">
                  <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/userhead/100/100"} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
        )}

        {isMobile && headerIsVisible && (
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4">
                <div className="flex w-full items-center gap-2">
                    <SidebarTrigger />
                    <h1 className="font-headline text-lg font-bold truncate">
                        {navItems.find(item => item.href === pathname)?.title || 'PetMets'}
                    </h1>
                </div>
            </header>
          )}
        <main className={cn("flex-1 overflow-auto", isDynamicPage && "h-screen", "pb-20 md:pb-0")}>
          <div className={cn(!isDynamicPage && !isDashboard && "p-4 sm:p-8")}>
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
