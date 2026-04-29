
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Camera, Ticket, Star, MapPin } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Provider {
  id: string;
  name: string;
  service: string;
  bio: string;
  location: string;
  image: string;
  rating: number;
}

export default function PetPhotographyPage() {
  const [photographers, setPhotographers] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "providers"), where("service", "==", "Photography"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPhotographers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-headline">Pet Photography</h1>
        <p className="mt-4 text-lg text-muted-foreground">Capture your pet's personality with a professional photoshoot.</p>
        <Link href="/providers?service=photography" passHref>
           <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                <Camera className="mr-2 h-5 w-5" /> Find Photographers
            </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
        ) : photographers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">No professional photographers found yet.</div>
        ) : (
          photographers.map((photog) => (
            <Card key={photog.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-60 w-full">
                <Image src={photog.image} alt={photog.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-xl">{photog.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" /> {photog.location}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">"{photog.bio}"</p>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" /> {photog.rating} stars
                </div>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full">
                    <Ticket className="mr-2 h-4 w-4" /> Raise a Ticket to Book
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
