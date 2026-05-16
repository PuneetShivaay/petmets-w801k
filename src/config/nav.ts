
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
    icon: Bell,
    roles: ['owner'],
  },
  {
    title: 'Adoption',
    href: '/adoption',
    icon: Heart,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Pet Profile',
    href: '/pet-profile',
    icon: User,
    roles: ['owner'],
  },
  {
    title: 'Service Providers',
    href: '/providers',
    icon: Users,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Pet Chats',
    href: '/chats',
    icon: MessageSquare,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Digital Records',
    href: '/records',
    icon: FileText,
    roles: ['owner'],
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: CalendarDays,
    roles: ['owner', 'provider'],
  },
  {
    title: 'My Business Listing',
    href: '/business-profile',
    icon: Briefcase,
    roles: ['provider'],
  },
  {
    title: 'Login / Sign Up',
    href: '/login',
    icon: LogIn,
  },
];
