
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Scissors, Sparkles, ShieldCheck, MapPin, Star } from "lucide-react";
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

export default function PetGroomingPage() {
  const [groomers, setGroomers] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "providers"), where("service", "==", "Grooming"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGroomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">Connect with expert pet groomers. Pamper your pet today!</p>
        <Link href="/providers?service=grooming" passHref>
          <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Scissors className="mr-2 h-5 w-5" /> Find a Groomer
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
        ) : groomers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">No groomers found.</div>
        ) : (
          groomers.map((groomer) => (
            <Card key={groomer.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-72 w-full">
                <Image src={groomer.image} alt={groomer.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-lg sm:text-xl">{groomer.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" /> {groomer.location}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">"{groomer.bio}"</p>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" /> {groomer.rating} stars
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Sparkles className="mr-2 h-4 w-4" /> Book a Session
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
