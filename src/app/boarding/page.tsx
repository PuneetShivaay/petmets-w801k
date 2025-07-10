
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Hotel, BedDouble, ToyBrick, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PetBoardingPage() {
  const boardingFacilities = [
    { id: 1, name: "Cozy Paws Inn", features: "Private Suites, Playgroups, Daily Walks", image: "https://placehold.co/400x300.png", dataAiHint: "pet hotel room" },
    { id: 2, name: "Happy Tails Resort", features: "Luxury Kennels, Outdoor Play Area, 24/7 Supervision", image: "https://placehold.co/400x300.png", dataAiHint: "dog boarding facility" },
    { id: 3, name: "The Comfort Kennel", features: "Climate Controlled, Nap Corners, Medication Admin", image: "https://placehold.co/400x300.png", dataAiHint: "cat boarding" },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Facilitate pet boarding services in cozy and safe environments. Featuring supervised care, playgroups, and comfy nap corners for your peace of mind.</p>
        <Link href="/providers?service=boarding" passHref>
          <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Hotel className="mr-2 h-5 w-5" /> Find Boarding
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {boardingFacilities.map((facility) => (
          <Card key={facility.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-52 w-full">
              <Image 
                src={facility.image} 
                alt={facility.name} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                data-ai-hint={facility.dataAiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-lg sm:text-xl">{facility.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <ShieldCheck className="mr-1 h-4 w-4 text-green-500" /> Safe & Secure
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"> <BedDouble className="h-4 w-4 text-primary" /> <span>{facility.features.split(', ')[0]}</span> </div>
                <div className="flex items-center gap-2"> <ToyBrick className="h-4 w-4 text-primary" /> <span>{facility.features.split(', ')[1]}</span> </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/providers/boarding/${facility.id}`} passHref className="w-full">
                <Button variant="outline" className="w-full">
                 View Details & Book
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
