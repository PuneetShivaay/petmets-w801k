import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Heart, Search } from "lucide-react";

export default function MatchPetPage() {
  const petsForMatching = [
    { id: 1, name: "Buddy", breed: "Golden Retriever", image: "https://placehold.co/300x300.png", dataAiHint: "dog wedding" },
    { id: 2, name: "Lucy", breed: "Siamese Cat", image: "https://placehold.co/300x300.png", dataAiHint: "cat party" },
    { id: 3, name: "Charlie", breed: "Beagle", image: "https://placehold.co/300x300.png", dataAiHint: "happy dog" },
  ];

  return (
    <div>
      <PageHeader
        title="Match Your Pet"
        description="Find the perfect pet companion for pre-wedding photoshoots and joyous celebrations. Coordinate booking details seamlessly."
      />
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" /> Filter Pets
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {petsForMatching.map((pet) => (
          <Card key={pet.id} className="overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-60 w-full">
              <Image 
                src={pet.image} 
                alt={pet.name} 
                layout="fill" 
                objectFit="cover" 
                data-ai-hint={pet.dataAiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{pet.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{pet.breed}</p>
              <Button className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90">
                <Heart className="mr-2 h-4 w-4" /> Request Match
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
