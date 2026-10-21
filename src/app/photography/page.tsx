"use client";

import { Camera, Ticket } from "lucide-react";
import { ServiceProviderListing } from "@/components/features/service-provider-listing";

export default function PetPhotographyPage() {
  return (
    <ServiceProviderListing
      service="Photography"
      title="Pet Photography"
      intro="Capture your pet's personality with a professional photoshoot."
      cta={{ label: "Find Photographers", href: "/providers?service=photography", icon: Camera }}
      emptyText="No professional photographers found yet."
      imageHeight="h-60"
      action={{ label: "Raise a Ticket to Book", icon: Ticket }}
    />
  );
}
