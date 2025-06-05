import { PageHeader } from "@/components/page-header";
import { FeatureCard } from "@/components/feature-card";
import { navItems } from "@/config/nav";
import { LayoutDashboard } from "lucide-react"; // Import default icon

export default function HomePage() {
  // Filter out the dashboard link itself for feature cards
  const features = navItems.filter(item => item.href !== '/');

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Welcome to PetMets!"
        description="Your all-in-one platform for pet care and services. Explore what we offer:"
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
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
