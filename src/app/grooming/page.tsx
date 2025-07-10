
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Scissors, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PetGroomingPage() {
  const groomers = [
    { id: 1, name: "Paws & Polish", services: "Full Groom, Bath & Brush, Nail Trim", image: "https://placehold.co/400x400.png", dataAiHint: "groomed dog" },
    { id: 2, name: "Furry Glamour", services: "Show Cuts, Spa Treatments, De-shedding", image: "https://placehold.co/400x400.png", dataAiHint: "happy pet grooming" },
    { id: 3, name: "The Dapper Dog", services: "Breed-specific Styling, Puppy's First Groom", image: "https://placehold.co/400x400.png", dataAiHint: "cat grooming salon" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">Connect with expert pet groomers. Showcasing adorable, freshly-groomed pets photographed like furry celebrities. Pamper your pet today!</p>
        <Link href="/providers?service=groomers" passHref>
          <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Scissors className="mr-2 h-5 w-5" /> Find a Groomer
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groomers.map((groomer) => (
          <Card key={groomer.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-72 w-full">
              <Image 
                src={groomer.image} 
                alt={groomer.name} 
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                data-ai-hint={groomer.dataAiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-lg sm:text-xl">{groomer.name}</CardTitle>
               <div className="flex items-center text-sm text-muted-foreground">
                <ShieldCheck className="mr-1 h-4 w-4 text-green-500" /> Professional Grooming
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="font-semibold text-primary">Services Include:</p>
              <p className="mt-1 text-sm text-muted-foreground">{groomer.services}</p>
            </CardContent>
            <CardFooter>
               <Link href={`/providers/groomer/${groomer.id}`} passHref className="w-full">
                <Button variant="outline" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" /> Book a Session
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
