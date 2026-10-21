"use client";

import { PawPrint, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceProviderListing } from "@/components/features/service-provider-listing";

export default function PetWalkersPage() {
  return (
    <ServiceProviderListing
      service="Walking"
      intro="Connect with verified and experienced pet walkers. Ensure your furry friends get their daily dose of exercise."
      cta={{ label: "Browse All Walkers", href: "/providers?service=walking", icon: PawPrint }}
      emptyText="No walkers registered in your area yet."
      imageHeight="h-60"
      renderAction={(walker) => (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">View Details & Contact</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{walker.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{walker.email || "Available via dashboard"}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    />
  );
}
