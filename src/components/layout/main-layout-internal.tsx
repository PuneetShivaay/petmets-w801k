"use client"; 

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppLogo } from "@/components/icons";
import { navItems, quickLinks } from "@/config/nav";
import { cn } from "@/lib/utils";
import placeholderImages from "@/app/lib/placeholder-images.json";
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
import { LogOut, Bell, Search, MapPin, User, ChevronDown, Settings } from "lucide-react";
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

  const displayName = userData?.name || user?.displayName || 'User';
  const userAvatar = userData?.avatar || user?.photoURL;
  const userInitial = displayName.charAt(0).toUpperCase();

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

  const handleSidebarSearch = (e: React.KeyboardEvent) => {
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F8FAFC]">
      <Sidebar className="border-r border-sidebar-border hidden md:flex bg-white transition-all duration-300 h-full" collapsible="icon">
        <SidebarHeader className={cn("p-6 flex flex-row items-center justify-between gap-2", state === 'collapsed' && "justify-center p-2")}>
          <Link href="/" onClick={handleLinkClick} className="block group-data-[state=collapsed]:hidden overflow-hidden whitespace-nowrap">
            <AppLogo />
          </Link>
          <SidebarTrigger className={cn(state === 'collapsed' ? 'mx-auto' : 'ml-auto')} />
        </SidebarHeader>
        
        <SidebarContent className="overflow-y-auto overflow-x-hidden px-4 py-2 flex flex-col justify-between scrollbar-hide">
          <SidebarMenu className={cn("gap-2 w-full", state === 'collapsed' && "items-center")}>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href} className="w-full">
                <Link href={item.href} passHref legacyBehavior>
                  <SidebarMenuButton
                    asChild={item.href.startsWith("/")}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className={cn(
                      "w-full transition-all duration-200 rounded-2xl",
                      pathname === item.href 
                        ? "bg-primary text-white hover:bg-primary/95 shadow-lg font-black" 
                        : "text-slate-500 hover:bg-slate-50 font-bold",
                      state === 'collapsed' ? 'h-12 w-12 p-0 justify-center mx-auto' : 'px-5 py-6 justify-start'
                    )}
                    onClick={item.href.startsWith("/") ? handleLinkClick : undefined}
                  >
                    <div className={cn("flex items-center w-full gap-4", state === 'collapsed' && 'justify-center gap-0')}>
                      <item.icon className={cn("h-5 w-5 shrink-0 transition-colors", pathname === item.href ? "text-white" : "text-slate-400")} />
                      <span className="text-sm tracking-tight group-data-[state=collapsed]:hidden truncate">{item.title}</span>
                      {item.badge && state === 'expanded' && (
                        <Badge className="ml-auto bg-primary text-white border-none h-5 w-5 flex items-center justify-center p-0 text-[10px] rounded-full shrink-0 shadow-sm">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}

            <div className="mt-8 px-5 mb-2 group-data-[state=collapsed]:hidden">
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em] block">Support Hub</span>
            </div>

            {quickLinks.map((item) => (
              <SidebarMenuItem key={item.title} className="w-full">
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "w-full transition-all duration-200 rounded-2xl text-slate-500 hover:bg-slate-50 font-bold",
                    state === 'collapsed' ? 'h-12 w-12 p-0 justify-center mx-auto' : 'px-5 py-5'
                  )}
                >
                  <div className={cn("flex items-center gap-4", state === 'collapsed' && 'justify-center gap-0')}>
                    <item.icon className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-sm group-data-[state=collapsed]:hidden truncate">{item.title}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className={cn("mt-auto", state === 'collapsed' ? "p-3 items-center" : "p-6")}>
          <div className="space-y-6 w-full flex flex-col items-center">
            <div className="relative p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group-data-[state=collapsed]:hidden w-full overflow-hidden shadow-sm">
              <div className="relative z-10 text-[10px] font-black text-slate-800 italic leading-relaxed uppercase tracking-widest">
                Happy Pets<br/>Happy People<br/>Better World 🧡
              </div>
              <div className="absolute -bottom-2 -right-2 w-20 h-20 opacity-20 rotate-12 transition-transform group-hover:scale-110">
                <Image 
                  src={placeholderImages.sidebar.footer.url} 
                  alt="Pet" 
                  width={placeholderImages.sidebar.footer.width}
                  height={placeholderImages.sidebar.footer.height}
                  className="object-contain"
                  data-ai-hint={placeholderImages.sidebar.footer.hint}
                />
              </div>
            </div>
            {user && (
              <SidebarMenuButton
                tooltip="Logout"
                className={cn(
                  "justify-start text-slate-400 hover:text-destructive transition-all duration-200 h-10 rounded-xl",
                  state === 'collapsed' ? 'w-10 p-0 justify-center' : 'w-full px-5'
                )}
                onClick={handleLogoutClick}
              >
                <div className="flex items-center w-full gap-4 justify-start group-data-[state=collapsed]:justify-center">
                  <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black shrink-0">
                    {userInitial}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest group-data-[state=collapsed]:hidden">Logout</span>
                </div>
              </SidebarMenuButton>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {!isMobile && (
          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-center bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100">
            <div className="max-w-[1400px] w-full px-4 flex items-center justify-between gap-4">
              <div className="flex flex-1 items-center max-w-lg relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                <Input 
                  className="w-full pl-10 bg-slate-50 border-none rounded-xl h-9 text-xs font-medium focus-visible:ring-1 focus-visible:ring-primary/20 placeholder:text-slate-300 transition-all focus-visible:bg-white" 
                  placeholder="Search services, products, vets..."
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  onKeyDown={handleSidebarSearch}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-600 transition-all border border-transparent hover:border-slate-100">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-wider">India</span>
                  <ChevronDown className="h-3 w-3 text-slate-300" />
                </div>

                <div className="relative cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-all border border-transparent hover:border-slate-100">
                  <Bell className="h-4 w-4 text-slate-600" />
                  <Badge className="absolute top-1 right-1 h-3.5 w-3.5 bg-destructive text-white border-2 border-white flex items-center justify-center p-0 text-[7px] rounded-full font-black shadow-sm">
                    3
                  </Badge>
                </div>

                <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
                  <Link href="/pet-profile" onClick={handleLinkClick}>
                    <Avatar className="h-8 w-8 border border-slate-100 shadow-sm transition-transform hover:scale-110 cursor-pointer">
                      <AvatarImage src={userAvatar} className="object-cover" />
                      <AvatarFallback className="bg-slate-50 text-[10px] font-bold">{userInitial}</AvatarFallback>
                    </Avatar>
                  </Link>
                </div>
              </div>
            </div>
          </header>
        )}

        {isMobile && headerIsVisible && (
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
                <div className="flex w-full items-center gap-2">
                    <SidebarTrigger />
                    <h1 className="font-headline text-xs font-bold truncate uppercase tracking-widest text-slate-900">
                        {navItems.find(item => item.href === pathname)?.title || 'PetMets'}
                    </h1>
                </div>
            </header>
          )}
        
        <main className={cn("flex-1 overflow-y-auto min-h-0", isDynamicPage && "h-full", "pb-20 md:pb-0")}>
          <div className={cn(!isDynamicPage && !isDashboard && "p-4 sm:p-8")}>
            {children}
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

export function MainLayoutInternal({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen className="h-screen overflow-hidden">
      <MainLayoutChild>{children}</MainLayoutChild>
    </SidebarProvider>
  );
}
