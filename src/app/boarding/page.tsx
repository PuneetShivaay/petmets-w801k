"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Hotel, MapPin, Star } from "lucide-react";
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

export default function PetBoardingPage() {
  const [facilities, setFacilities] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "service_providers"), where("service", "==", "Boarding"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFacilities(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching boarding:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">Facilitate pet boarding services in cozy and safe environments. Supervised care for your peace of mind.</p>
        <Link href="/providers?service=boarding" passHref>
          <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <Hotel className="mr-2 h-5 w-5" /> Find Boarding
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
        ) : facilities.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">No boarding facilities found.</div>
        ) : (
          facilities.map((facility) => (
            <Card key={facility.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-52 w-full">
                <Image src={facility.image} alt={facility.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-lg sm:text-xl">{facility.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" /> {facility.location}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-2">"{facility.bio}"</p>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" /> {facility.rating} stars
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                 View Details & Book
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}