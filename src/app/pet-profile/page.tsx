
"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, User, Edit3, Mail, Phone, Home } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { Skeleton } from "@/components/ui/skeleton";

export default function PetProfilePage() {
  const { user, isLoading: authLoading } = useAuth();

  // Static pet data for now
  const petData = {
    name: "Buddy",
    breed: "Golden Retriever",
    age: "3 years",
    avatar: "https://placehold.co/128x128.png",
    dataAiHint: "golden retriever",
    bio: "Loves long walks in the park and playing fetch. A very good boy indeed!",
  };

  // Owner data will be dynamic based on auth user
  const ownerData = {
    name: user?.displayName || "Pet Owner", // Firebase User object might not have displayName with email/password
    email: user?.email || "loading...",
    phone: "555-123-4567", // Placeholder
    avatar: "https://placehold.co/128x128.png", // Placeholder for owner avatar
    dataAiHint: "friendly person",
    address: "123 Pet Street, Pawville, CA 90210", // Placeholder
  };

  return (
    <div>
      <PageHeader
        title="Pet & Owner Profile"
        description="View and manage your pet's details and your account information."
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Pet Profile Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={petData.avatar} alt={petData.name} data-ai-hint={petData.dataAiHint} />
                <AvatarFallback><PawPrint className="h-10 w-10" /></AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="font-headline text-2xl sm:text-3xl">{petData.name}</CardTitle>
                <p className="text-muted-foreground">{petData.breed}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Age</span>
              <p id="petAge" className="text-lg">{petData.age}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Bio</span>
              <p id="petBio" className="text-md italic text-foreground">
                {petData.bio}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Medical Notes (Placeholder)</h4>
              <p className="text-sm text-gray-600">No allergies known. Up to date with vaccinations.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Pet Details
            </Button>
          </CardFooter>
        </Card>

        {/* Owner Profile Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-accent">
                <AvatarImage src={ownerData.avatar} alt={ownerData.name} data-ai-hint={ownerData.dataAiHint} />
                <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
              </Avatar>
              <div>
                 {authLoading ? (
                  <Skeleton className="h-8 w-40" />
                ) : (
                  <CardTitle className="font-headline text-2xl sm:text-3xl">{ownerData.name}</CardTitle>
                )}
                <p className="text-muted-foreground">Pet Owner</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              {authLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <p className="text-lg">{ownerData.email}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
               <Phone className="h-5 w-5 text-muted-foreground" />
              <p className="text-lg">{ownerData.phone} <span className="text-xs text-muted-foreground">(Placeholder)</span></p>
            </div>
            <div className="flex items-start gap-2">
              <Home className="h-5 w-5 text-muted-foreground mt-1" />
              <p className="text-lg">{ownerData.address} <span className="text-xs text-muted-foreground">(Placeholder)</span></p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Account Details
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="mt-8 bg-primary/10">
        <CardContent className="p-6">
          <h3 className="font-headline text-xl font-semibold text-primary">Keep Your Information Up-to-Date!</h3>
          <p className="mt-2 text-muted-foreground">
            Regularly updating your pet's and your own information helps us provide the best service and ensures smooth communication for bookings and emergencies. Other details like your name, phone, and address are currently placeholders.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
