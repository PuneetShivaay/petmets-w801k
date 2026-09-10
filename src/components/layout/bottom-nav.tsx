'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from '@/config/nav';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { useLoading } from '@/contexts/loading-context';

export function BottomNav() {
  const pathname = usePathname();
  const { userRole } = useAuth();
  const { showLoading } = useLoading();

  if (!userRole) return null;

  // Filter items for the bottom bar
  const bottomNavItems = navItems.filter((item) => {
    if (item.href === '/login') return false;
    if (item.roles && !item.roles.includes(userRole)) return false;
    
    // Select specific items for the 5-slot bottom bar
    const allowed = ['Home', 'Match Your Pet', 'Service Providers', 'Messages', 'Profile', 'My Business Listing'];
    return allowed.includes(item.title);
  }).slice(0, 5); 

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/95 pb-safe backdrop-blur-md md:hidden">
      {bottomNavItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => !isActive && showLoading()}
            className={cn(
              "flex flex-col items-center justify-center gap-1 px-2 transition-colors relative",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className={cn("h-6 w-6", isActive && "fill-primary/10")} />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {item.title === 'Home' ? 'Home' : 
               item.title === 'Match Your Pet' ? 'Match' : 
               item.title === 'Service Providers' ? 'Services' : 
               item.title === 'Messages' ? 'Messages' : 
               item.title === 'Profile' || item.title === 'My Business Listing' ? 'Profile' : item.title}
            </span>
            {item.title === 'Messages' && item.badge && (
               <div className="absolute top-2 right-4 h-2 w-2 rounded-full bg-primary border border-white" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
