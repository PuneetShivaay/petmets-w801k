
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { GraduationCap, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function PetTrainingPage() {
  const trainers = [
    { id: 1, name: "Alex P.", specialty: "Obedience & Agility", image: "https://placehold.co/400x300.png", dataAiHint: "dog training class" },
    { id: 2, name: "Maria G.", specialty: "Puppy Essentials & Trick Training", image: "https://placehold.co/400x300.png", dataAiHint: "trainer with dog" },
    { id: 3, name: "David L.", specialty: "Behavioral Modification", image: "https://placehold.co/400x300.png", dataAiHint: "dog obedience" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg text-muted-foreground">Connect with certified pet trainers. Featuring real photos of trainers working with dogs, teaching obedience, tricks, and building confidence.</p>
        <Link href="/providers?service=trainers" passHref>
          <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <GraduationCap className="mr-2 h-5 w-5" /> Find a Trainer
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trainers.map((trainer) => (
          <Card key={trainer.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-52 w-full">
              <Image 
                src={trainer.image} 
                alt={trainer.name} 
                fill 
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                data-ai-hint={trainer.dataAiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-lg sm:text-xl">{trainer.name}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <ShieldCheck className="mr-1 h-4 w-4 text-green-500" /> Certified Trainer
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="font-semibold text-primary">{trainer.specialty}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Helping pets become well-behaved and confident companions through positive reinforcement techniques.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/providers/trainer/${trainer.id}`} passHref className="w-full">
                <Button variant="outline" className="w-full">
                  <Zap className="mr-2 h-4 w-4" /> Learn More & Book
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
