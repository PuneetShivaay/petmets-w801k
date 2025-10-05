
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Camera, Ticket } from "lucide-react";
import Link from "next/link";

export default function PetPhotographyPage() {
  const photoExamples = [
    { id: 1, alt: "A golden retriever smiling in a sunny field", image: "https://placehold.co/600x400.png", dataAiHint: "dog photography" },
    { id: 2, alt: "A sleek black cat posing in a stylish indoor setting", image: "https://placehold.co/600x400.png", dataAiHint: "cat portrait" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Pet Photography</h1>
        <p className="mt-4 text-lg text-muted-foreground">Capture your pet's personality with a professional photoshoot. Our photographers create stunning portraits you'll cherish forever.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {photoExamples.map((photo) => (
          <div key={photo.id} className="relative h-80 w-full overflow-hidden rounded-lg shadow-lg">
            <Image 
              src={photo.image} 
              alt={photo.alt} 
              fill 
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{objectFit: 'cover'}}
              data-ai-hint={photo.dataAiHint}
            />
          </div>
        ))}
      </div>

      <Card className="bg-primary/10 border-primary shadow-lg">
        <CardHeader>
          <div className="flex flex-col items-center text-center gap-2">
            <Camera className="h-10 w-10 text-primary" />
            <CardTitle className="font-headline text-2xl sm:text-3xl">Ready for a Close-Up?</CardTitle>
            <CardContent className="p-0">
                <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                    Our professional photographers are experts at capturing the unique spirit of your furry, feathered, or scaled friend. To get started, simply raise a ticket, and our team will contact you to arrange the perfect session.
                </p>
            </CardContent>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-center">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Ticket className="mr-2 h-5 w-5" /> Raise a Ticket to Book
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
