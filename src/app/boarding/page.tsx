"use client";

import { Hotel } from "lucide-react";
import { ServiceProviderListing } from "@/components/features/service-provider-listing";

export default function PetBoardingPage() {
  return (
    <ServiceProviderListing
      service="Boarding"
      intro="Facilitate pet boarding services in cozy and safe environments. Supervised care for your peace of mind."
      cta={{ label: "Find Boarding", href: "/providers?service=boarding", icon: Hotel }}
      emptyText="No boarding facilities found."
      action={{ label: "View Details & Book" }}
    />
  );
}
