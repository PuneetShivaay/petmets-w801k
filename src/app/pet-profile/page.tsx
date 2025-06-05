
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PawPrint, User, Edit3 } from "lucide-react";
import Image from "next/image";

export default function PetProfilePage() {
  const petData = {
    name: "Buddy",
    breed: "Golden Retriever",
    age: "3 years",
    avatar: "https://placehold.co/128x128.png",
    dataAiHint: "golden retriever",
    bio: "Loves long walks in the park and playing fetch. A very good boy indeed!",
  };

  const ownerData = {
    name: "Alex Doe",
    email: "alex.doe@example.com",
    phone: "555-123-4567",
    avatar: "https://placehold.co/128x128.png",
    dataAiHint: "friendly person",
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
                <CardTitle className="font-headline text-3xl">{petData.name}</CardTitle>
                <p className="text-muted-foreground">{petData.breed}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="petAge" className="text-sm font-medium text-muted-foreground">Age</Label>
              <p id="petAge" className="text-lg">{petData.age}</p>
            </div>
            <div>
              <Label htmlFor="petBio" className="text-sm font-medium text-muted-foreground">Bio</Label>
              <p id="petBio" className="text-md italic text-foreground">
                {petData.bio}
              </p>
            </div>
            {/* Placeholder for more pet details */}
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
                <CardTitle className="font-headline text-3xl">{ownerData.name}</CardTitle>
                <p className="text-muted-foreground">Pet Owner</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ownerEmail" className="text-sm font-medium text-muted-foreground">Email</Label>
              <p id="ownerEmail" className="text-lg">{ownerData.email}</p>
            </div>
            <div>
              <Label htmlFor="ownerPhone" className="text-sm font-medium text-muted-foreground">Phone</Label>
              <p id="ownerPhone" className="text-lg">{ownerData.phone}</p>
            </div>
             {/* Placeholder for address */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-semibold text-muted-foreground">Address (Placeholder)</h4>
              <p className="text-sm text-gray-600">123 Pet Street, Pawville, CA 90210</p>
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
            Regularly updating your pet's and your own information helps us provide the best service and ensures smooth communication for bookings and emergencies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
