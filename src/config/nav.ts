
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
  Wallet,
  HelpCircle,
  Settings,
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
    title: 'Home',
    href: '/',
    icon: LayoutDashboard,
    roles: ['owner', 'provider'],
  },
  {
    title: 'My Pets',
    href: '/pet-profile',
    icon: Dog,
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
    title: 'Community',
    href: '/match',
    icon: Users,
    roles: ['owner'],
  },
  {
    title: 'Messages',
    href: '/chats',
    icon: MessageSquare,
    roles: ['owner', 'provider'],
    badge: 3,
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
