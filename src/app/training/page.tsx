"use client";

import { GraduationCap, Zap } from "lucide-react";
import { ServiceProviderListing } from "@/components/features/service-provider-listing";

export default function PetTrainingPage() {
  return (
    <ServiceProviderListing
      service="Training"
      intro="Connect with certified pet trainers using positive reinforcement techniques."
      cta={{ label: "Find a Trainer", href: "/providers?service=training", icon: GraduationCap }}
      emptyText="No trainers found."
      action={{ label: "Learn More & Book", icon: Zap }}
    />
  );
}
