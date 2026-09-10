
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
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

function MainLayoutChild({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const { showLoading } = useLoading();
  const { user, userRole, userSignOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [userData, setUserData] = React.useState<any>(null);
  const [headerSearch, setHeaderSearch] = React.useState("");

  React.useEffect(() => {
    if (!user) {
      setUserData(null);
      return;
    }
    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, [user]);

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

  const handleHeaderSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && headerSearch.trim()) {
      router.push(`/providers?search=${encodeURIComponent(headerSearch.trim())}`);
      setHeaderSearch("");
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

  const headerAvatar = userData?.avatar || user?.photoURL || "https://picsum.photos/seed/userhead/100/100";

  return (
    <>
      <Sidebar className="border-r border-sidebar-border hidden md:flex bg-white" collapsible="icon">
        <SidebarHeader className="p-6 md:p-8 flex flex-row items-center justify-between">
          <Link href="/" onClick={handleLinkClick} className="block group-data-[state=collapsed]:hidden">
            <AppLogo />
          </Link>
          <SidebarTrigger className={cn(state === 'collapsed' ? 'mx-auto' : 'ml-auto')} />
        </SidebarHeader>
        <SidebarContent className="px-4">
          <ScrollArea className="flex-grow">
            <SidebarMenu className="gap-2">
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} passHref legacyBehavior>
                    <SidebarMenuButton
                      asChild={item.href.startsWith("/")}
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      className={cn(
                        "w-full justify-start rounded-xl transition-all",
                        pathname === item.href ? "bg-primary text-white hover:bg-primary/90 shadow-md" : "text-slate-600 hover:bg-slate-50",
                        state === 'collapsed' ? 'px-0 justify-center' : 'px-4 py-6'
                      )}
                      onClick={item.href.startsWith("/") ? handleLinkClick : undefined}
                    >
                      <div className={cn("flex items-center w-full", state === 'collapsed' && 'justify-center')}>
                        <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-slate-400", state === 'expanded' && 'mr-4')} />
                        <span className="font-bold text-sm tracking-tight group-data-[state=collapsed]:hidden">{item.title}</span>
                        {item.badge && state === 'expanded' && (
                          <Badge className="ml-auto bg-primary text-white border-none h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}

              <div className="mt-8 px-4 mb-2 group-data-[state=collapsed]:hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick Links</span>
              </div>

              {quickLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="w-full justify-start rounded-xl text-slate-500 hover:bg-slate-50"
                  >
                    <div className={cn("flex items-center", state === 'collapsed' && 'justify-center w-full')}>
                      <item.icon className={cn("h-4 w-4 text-slate-400", state === 'expanded' && 'mr-4')} />
                      <span className="text-sm font-medium group-data-[state=collapsed]:hidden">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-8 mt-auto">
            <div className="space-y-8">
              <div className="relative p-6 rounded-[2rem] bg-slate-50/80 overflow-hidden border border-slate-100 group-data-[state=collapsed]:hidden">
                <div className="relative z-10 text-[11px] font-bold text-slate-600 italic leading-snug">
                  Happy Pets<br/>Happy People<br/>Better World 🧡
                </div>
                <div className="absolute -bottom-2 -left-4 w-20 h-20 opacity-40 rotate-12">
                  <Image 
                    src="https://picsum.photos/seed/footer-dog/100/100" 
                    alt="Pet" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              {user && (
                <SidebarMenuButton
                  tooltip="Logout"
                  className="w-full justify-start text-slate-400 hover:text-destructive px-4"
                  onClick={handleLogoutClick}
                >
                  <LogOut className={cn("h-4 w-4", state === 'expanded' && 'mr-3')} />
                  <span className="text-xs font-bold group-data-[state=collapsed]:hidden">Logout</span>
                </SidebarMenuButton>
              )}
            </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col bg-[#F8FAFC]">
        {!isMobile && (
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between gap-6 border-b bg-white px-10 shadow-sm">
            <div className="flex flex-1 items-center max-w-2xl relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                className="w-full pl-12 bg-slate-50 border-none rounded-xl h-11 text-xs focus-visible:ring-1 focus-visible:ring-primary/20" 
                placeholder="Search for services, products, vets, trainers, or anything..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={handleHeaderSearch}
              />
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-50 cursor-pointer text-slate-600 transition-colors">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm font-bold">India</span>
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
                  <AvatarImage src={headerAvatar} className="object-cover" />
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
