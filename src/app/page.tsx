
"use client";

import { PageHeader } from "@/components/page-header";
import { FeatureCard } from "@/components/feature-card";
import { navItems, type NavItem } from "@/config/nav";
import { LayoutDashboard } from "lucide-react"; // Import default icon
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const { user } = useAuth();

  // Filter out links that shouldn't be shown as feature cards
  // and also filter based on auth status.
  const features = navItems.filter(item => {
    if (item.href === '/') return false; // Exclude the dashboard link itself
    if (item.href === '/login') return !user; // Show Login/Sign Up only if not logged in
    if (item.href === '/pet-profile') return !!user; // Show Pet Profile only if logged in
    // For any other special-purpose links that shouldn't be cards (e.g. logout), filter them.
    // Currently, logout is not in navItems as a direct link.
    return !item.isFooterAction; 
  });

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Welcome to PetMets!"
        description="Your all-in-one platform for pet care and services. Explore what we offer:"
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature: NavItem) => (
          <FeatureCard
            key={feature.href}
            icon={feature.icon || LayoutDashboard} // Use a default icon if none provided
            title={feature.title}
            description={`Discover ${feature.title.toLowerCase()} services and features.`}
            href={feature.href}
          />
        ))}
      </div>
    </div>
  );
}
