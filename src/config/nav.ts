
import type { LucideIcon } from 'lucide-react';
import {
  Dog,
  FileText,
  CalendarDays,
  LayoutDashboard,
  User,
  MessageSquare,
  Search,
  Heart,
  Briefcase,
  HelpCircle,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  roles?: ('owner' | 'provider')[];
  badge?: number;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Pet Profile',
    href: '/pet-profile',
    icon: Dog,
    roles: ['owner'],
  },
  {
    title: 'Service Providers',
    href: '/providers',
    icon: Search,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Adoption',
    href: '/adoption',
    icon: Heart,
    roles: ['owner'],
  },
  {
    title: 'Match Your Pet',
    href: '/match',
    icon: Users,
    roles: ['owner'],
  },
  {
    title: 'Bookings',
    href: '/bookings',
    icon: CalendarDays,
    roles: ['owner', 'provider'],
  },
  {
    title: 'Pet Reports',
    href: '/records',
    icon: FileText,
    roles: ['owner'],
  },
  {
    title: 'Pet Chats',
    href: '/chats',
    icon: MessageSquare,
    roles: ['owner', 'provider'],
    badge: 3,
  },
  {
    title: 'My Business Listing',
    href: '/business-profile',
    icon: Briefcase,
    roles: ['provider'],
  },
  {
    title: 'Wallet & Offers',
    href: '#',
    icon: Wallet,
    roles: ['owner'],
  },
  {
    title: 'Profile',
    href: '/pet-profile',
    icon: User,
    roles: ['owner', 'provider'],
  },
];

export const quickLinks: NavItem[] = [
  {
    title: 'Support',
    href: '#',
    icon: HelpCircle,
  },
  {
    title: 'Help Center',
    href: '#',
    icon: HelpCircle,
  },
  {
    title: 'Settings',
    href: '#',
    icon: Settings,
  },
];
