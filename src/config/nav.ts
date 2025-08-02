
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  HeartHandshake,
  Trees,
  Users,
  Dog,
  GraduationCap,
  Scissors,
  Hotel,
  FileText,
  CalendarDays,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  MessageSquare,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  isFooterAction?: boolean; // To distinguish logout for different placement
}

export const navItems: NavItem[] = [
    {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Match Your Pet',
    href: '/match',
    icon: HeartHandshake,
  },
  {
    title: 'Pet Profile',
    href: '/pet-profile',
    icon: User,
  },
  {
    title: 'Pet Chats',
    href: '/chats',
    icon: MessageSquare,
  },
  {
    title: 'Pet Playzone',
    href: '/playzone',
    icon: Trees,
  },
  {
    title: 'Pet Walkers',
    href: '/walkers',
    icon: Dog,
  },
  {
    title: 'Pet Training',
    href: '/training',
    icon: GraduationCap,
  },
  {
    title: 'Pet Grooming',
    href: '/grooming',
    icon: Scissors,
  },
  {
    title: 'Pet Boarding',
    href: '/boarding',
    icon: Hotel,
  },
  {
    title: 'Service Providers',
    href: '/providers',
    icon: Users,
  },
  {
    title: 'Digital Records',
    href: '/records',
    icon: FileText,
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: CalendarDays,
  },
  // Authentication related links
  {
    title: 'Login / Sign Up',
    href: '/login',
    icon: LogIn,
  },
  // Logout is handled directly in the AppLayout footer for now
  // {
  //   title: 'Logout',
  //   href: '/logout', // This would typically be an action, not a page
  //   icon: LogOut,
  //   isFooterAction: true,
  // },
];
