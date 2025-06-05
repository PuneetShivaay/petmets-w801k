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
  LayoutDashboard
} from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Match Your Pet',
    href: '/match-pet',
    icon: HeartHandshake,
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
];
