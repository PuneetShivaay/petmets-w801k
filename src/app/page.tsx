
"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { navItems, type NavItem } from "@/config/nav";
import { FeatureCard } from "@/components/feature-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LogIn, ArrowRight } from "lucide-react";

// Define which nav items are suitable for the dashboard.
// We filter them further based on auth state.
const dashboardFeatureNavIdentifiers = [
  '/pet-profile',
  '/match-pet',
  '/playzone',
  '/walkers',
  '/training',
  '/grooming',
  '/boarding',
  '/providers',
  '/records',
  '/bookings',
  '/login'
];

// Simple descriptions for feature cards, as navItems don't have them.
const featureDescriptions: Record<string, string> = {
  '/pet-profile': "Manage your pet's profile and your details.",
  '/match-pet': "Find a companion for your pet for events.",
  '/playzone': "Discover our fun and safe pet play areas.",
  '/walkers': "Connect with trusted local pet walkers.",
  '/training': "Find certified trainers for your pet.",
  '/grooming': "Book professional grooming services.",
  '/boarding': "Secure a cozy spot for pet boarding.",
  '/providers': "Browse all available service providers.",
  '/records': "Keep your pet's digital records organized.",
  '/bookings': "View and manage your service bookings.",
  '/login': "Access your account or create a new one."
};


export default function HomePage() {
  const { user, isLoading: authIsLoading } = useAuth();

  const dashboardNavItems = navItems
    .filter(item => dashboardFeatureNavIdentifiers.includes(item.href))
    .filter(item => {
      if (item.href === '/login') return !user; 
      if (item.href === '/pet-profile') return !!user; 
      return true; 
    });

  if (authIsLoading) {
    return (
      <div className="container mx-auto">
        {/* Skeleton for Hero Section */}
        <Card className="overflow-hidden shadow-xl mb-6 md:mb-8">
            <div className="flex flex-col justify-center p-6 md:p-12">
              <Skeleton className="h-10 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/2 mb-6" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-5/6 mb-8" />
              <Skeleton className="h-10 w-40" />
            </div>
        </Card>
        
        {/* Skeleton for Features Section */}
        <div className="mb-8">
          <Skeleton className="mx-auto h-10 w-1/3 mb-6" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="flex flex-col">
              <Skeleton className="h-40 w-full rounded-t-lg" />
              <CardContent className="flex-grow p-4 pt-0">
                <Skeleton className="h-6 w-3/4 mt-4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 md:gap-8">
      {/* Hero Section */}
      <Card className="overflow-hidden rounded-xl shadow-2xl bg-card">
        <div className="grid grid-cols-1">
          <div className="flex flex-col justify-center p-6 md:p-12">
            {user ? (
              <>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Welcome back,
                </h1>
                <p className="mt-1 text-lg sm:text-xl text-primary truncate font-medium">{user.email}</p>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Ready to manage your pet's world? Explore services, update profiles, and much more, all in one place.
                </p>
                <div className="mt-8">
                  <Link href="/pet-profile" passHref>
                    <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-shadow">
                      Go to Your Profile <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                  Welcome to <span className="text-primary">Pet</span><span className="text-accent">Mets</span>!
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Your all-in-one platform for pet care. Find services, manage records, and connect with a community of pet lovers.
                </p>
                <div className="mt-8">
                  <Link href="/login" passHref>
                    <Button size="default" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-shadow">
                      Login or Sign Up <LogIn className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Features Section */}
      {dashboardNavItems.length > 0 && (
        <section>
          <h2 className="mb-6 text-center font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Explore <span className="text-primary">Pet</span><span className="text-accent">Mets</span>
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardNavItems.map((item) => (
              <FeatureCard
                key={item.href}
                icon={item.icon}
                title={item.title}
                description={featureDescriptions[item.href] || `Access ${item.title.toLowerCase()} services and information.`}
                href={item.href}
                actionText={item.href === '/login' ? "Login / Sign Up" : "Explore"}
              />
            ))}
          </div>
        </section>
      )}
      
      {user && dashboardNavItems.length === 0 && (
         <Card className="text-center shadow-lg">
            <CardContent className="p-10">
                <h3 className="font-headline text-2xl font-semibold text-foreground">All Set!</h3>
                <p className="mt-2 text-muted-foreground">You're viewing the main dashboard. Use the sidebar to navigate to other sections.</p>
            </CardContent>
         </Card>
      )}

    </div>
  );
}
