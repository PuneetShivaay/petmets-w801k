
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Waves, Sun } from "lucide-react";

export default function PetPlayzonePage() {
  const playzoneFeatures = [
    { title: "Spacious Garden", description: "Acres of green for your pet to roam freely.", image: "https://placehold.co/600x400.png", dataAiHint: "pet garden", icon: Sun },
    { title: "Swimming Pool", description: "A dedicated pool for pets to cool off and have fun.", image: "https://placehold.co/600x400.png", dataAiHint: "dog pool", icon: Waves },
  ];

  return (
    <div className="space-y-6">
      <p className="text-lg text-muted-foreground text-center">Our dedicated pet play area offers a spacious garden and a refreshing swimming pool for pure fun and freedom. Let your pets enjoy!</p>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {playzoneFeatures.map((feature, index) => (
          <Card key={index} className="overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-80 w-full">
              <Image 
                src={feature.image} 
                alt={feature.title} 
                fill 
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{objectFit: 'cover'}}
                data-ai-hint={feature.dataAiHint}
              />
            </div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="font-headline text-xl sm:text-2xl">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-6 bg-primary/10">
        <CardContent className="p-4 sm:p-6">
          <h3 className="font-headline text-xl font-semibold text-primary">Pure Fun & Freedom Awaits!</h3>
          <p className="mt-2 text-muted-foreground">
            Our playzone is designed with your pet's happiness and safety in mind. Supervised play areas ensure a positive experience for all furry friends.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
