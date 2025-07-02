
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PawPrint, Star, Search } from "lucide-react";
import Link from "next/link";

export default function ServiceProvidersPage() {
  const providers = [
    { id: 1, name: "Happy Paws Grooming", service: "Grooming", rating: 4.8, image: "https://placehold.co/350x250.png", dataAiHint: "pet grooming salon" },
    { id: 2, name: "Walky Talky Pets", service: "Walking", rating: 4.9, image: "https://placehold.co/350x250.png", dataAiHint: "dog walker" },
    { id: 3, name: "TrainMaster Dogs", service: "Training", rating: 5.0, image: "https://placehold.co/350x250.png", dataAiHint: "dog trainer" },
    { id: 4, name: "The Pet Hotel", service: "Boarding", rating: 4.7, image: "https://placehold.co/350x250.png", dataAiHint: "pet boarding" },
  ];

  return (
    <div>
      <PageHeader
        title="Find Pet Service Providers"
        description="Browse profiles of pet walkers, groomers, trainers, and boarding facilities. View photos, read detailed service descriptions, and book appointments."
      />
      <Card className="mb-8">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input placeholder="Search by name or keyword..." className="md:col-span-2" />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="walkers">Pet Walkers</SelectItem>
                <SelectItem value="groomers">Pet Groomers</SelectItem>
                <SelectItem value="trainers">Pet Trainers</SelectItem>
                <SelectItem value="boarding">Pet Boarding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="mt-4 w-full sm:w-auto">
            <Search className="mr-2 h-4 w-4" /> Search Providers
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card key={provider.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
            <div className="relative h-52 w-full">
              <Image 
                src={provider.image} 
                alt={provider.name} 
                layout="fill" 
                objectFit="cover"
                data-ai-hint={provider.dataAiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-lg sm:text-xl">{provider.name}</CardTitle>
              <p className="text-sm font-semibold text-primary">{provider.service}</p>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="flex items-center">
                <Star className="mr-1 h-5 w-5 fill-yellow-400 text-yellow-400" /> {provider.rating} stars
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                Detailed service description placeholder. Offering top-notch care for your beloved pets.
              </p>
            </CardContent>
            <CardFooter>
              <Link href={`/providers/profile/${provider.id}`} passHref className="w-full">
                <Button variant="outline" className="w-full">
                  <PawPrint className="mr-2 h-4 w-4" /> View Profile
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
