
import type { LucideIcon } from 'lucide-react';
import {
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
  User,
  MessageSquare,
  Bell,
  Camera,
  Heart,
  Briefcase,
  Search,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  roles?: ('owner' | 'provider')[];
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Match Your Pet',
    href: '/match',
    icon: Heart,
    roles: ['owner'],
  },
  {
    title: 'Service Providers',
    href: '/providers',
    icon: Search,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: CalendarDays,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Pet Chats',
    href: '/chats',
    icon: MessageSquare,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Pet Profile',
    href: '/pet-profile',
    icon: User,
    roles: ['owner'],
  },
  {
    title: 'My Business Listing',
    href: '/business-profile',
    icon: Briefcase,
    roles: ['provider'],
  },
  {
    title: 'Digital Records',
    href: '/records',
    icon: FileText,
    roles: ['owner'],
  },
  {
    title: 'Adoption',
    href: '/adoption',
    icon: Dog,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Login / Sign Up',
    href: '/login',
    icon: LogIn,
  },
];
