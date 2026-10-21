"use client";

import { Scissors, Sparkles } from "lucide-react";
import { ServiceProviderListing } from "@/components/features/service-provider-listing";

export default function PetGroomingPage() {
  return (
    <ServiceProviderListing
      service="Grooming"
      intro="Connect with expert pet groomers. Pamper your pet today!"
      cta={{ label: "Find a Groomer", href: "/providers?service=grooming", icon: Scissors }}
      emptyText="No groomers found."
      imageHeight="h-72"
      action={{ label: "Book a Session", icon: Sparkles }}
    />
  );
}
