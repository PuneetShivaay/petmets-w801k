
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PawPrint, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

export default function PetWalkersPage() {
  const walkers = [
    { id: 1, name: "Sarah M.", experience: "5+ years", rating: 4.9, image: "https://placehold.co/300x300.png", dataAiHint: "person walking dog" },
    { id: 2, name: "John B.", experience: "3 years", rating: 4.7, image: "https://placehold.co/300x300.png", dataAiHint: "dog walker park" },
    { id: 3, name: "Lisa K.", experience: "Certified Pro", rating: 5.0, image: "https://placehold.co/300x300.png", dataAiHint: "professional pet sitter" },
  ];

  return (
    <div>
      <PageHeader
        title="Professional Pet Walkers"
        description="Connect with verified and experienced pet walkers. Ensure your furry friends get their daily dose of exercise, walks, and sniffs with trusted professionals."
      />
      <div className="mb-6 text-center">
        <Link href="/providers?service=walkers" passHref>
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PawPrint className="mr-2 h-5 w-5" /> Browse All Walkers
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {walkers.map((walker) => (
          <Card key={walker.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-60 w-full">
              <Image 
                src={walker.image} 
                alt={walker.name} 
                layout="fill" 
                objectFit="cover"
                data-ai-hint={walker.dataAiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-lg sm:text-xl">{walker.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <ShieldCheck className="mr-1 h-4 w-4 text-green-500" /> Verified Professional
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm">Experience: {walker.experience}</p>
              <div className="mt-2 flex items-center">
                <Star className="mr-1 h-5 w-5 fill-yellow-400 text-yellow-400" /> {walker.rating} stars
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/providers/walker/${walker.id}`} passHref className="w-full">
                <Button variant="outline" className="w-full">View Profile & Book</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
