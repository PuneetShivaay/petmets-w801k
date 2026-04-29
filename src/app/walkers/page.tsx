"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PawPrint, Star, MapPin } from "lucide-react";
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

export default function PetWalkersPage() {
  const [walkers, setWalkers] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "service_providers"), where("service", "==", "Walking"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setWalkers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching walkers:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-muted-foreground">Connect with verified and experienced pet walkers. Ensure your furry friends get their daily dose of exercise.</p>
        <Link href="/providers?service=walking" passHref>
          <Button size="lg" className="mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
            <PawPrint className="mr-2 h-5 w-5" /> Browse All Walkers
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)
        ) : walkers.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4">No walkers registered in your area yet.</p>
          </div>
        ) : (
          walkers.map((walker) => (
            <Card key={walker.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-60 w-full">
                <Image src={walker.image} alt={walker.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-lg sm:text-xl">{walker.name}</CardTitle>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" /> {walker.location}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-2 italic mb-2">"{walker.bio}"</p>
                <div className="flex items-center">
                  <Star className="mr-1 h-5 w-5 fill-yellow-400 text-yellow-400" /> {walker.rating} stars
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View Profile & Book</Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}