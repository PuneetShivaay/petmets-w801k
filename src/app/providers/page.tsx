
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PawPrint, Star, Search, MapPin, Mail, Phone } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Provider {
  id: string;
  userId: string;
  name: string;
  service: string;
  bio: string;
  location: string;
  image: string;
  rating: number;
  email?: string;
  phone?: string;
  createdAt: any;
}

export default function ServiceProvidersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  useEffect(() => {
    const q = query(collection(db, "service_providers"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
      setProviders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching providers:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = providers;
    if (serviceFilter !== "all") {
      result = result.filter(p => p.service.toLowerCase() === serviceFilter.toLowerCase());
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.bio.toLowerCase().includes(lower) || 
        p.location.toLowerCase().includes(lower)
      );
    }
    setFilteredProviders(result);
  }, [providers, searchTerm, serviceFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-muted-foreground">Browse profiles of pet walkers, groomers, trainers, and boarding facilities. View photos and book appointments.</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, bio or location..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="walking">Pet Walkers</SelectItem>
                <SelectItem value="grooming">Pet Groomers</SelectItem>
                <SelectItem value="training">Pet Trainers</SelectItem>
                <SelectItem value="boarding">Pet Boarding</SelectItem>
                <SelectItem value="photography">Pet Photography</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}><Skeleton className="h-52 w-full" /><CardContent className="p-4"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))
        ) : filteredProviders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No Providers Found</p>
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <Card key={provider.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-52 w-full">
                <Image 
                  src={provider.image} 
                  alt={provider.name} 
                  fill 
                  style={{objectFit: 'cover'}}
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-headline">{provider.name}</CardTitle>
                <p className="text-sm font-semibold text-primary">{provider.service}</p>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <div className="flex items-center gap-1 text-sm mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{provider.rating} stars</span>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{provider.location}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 italic">
                  "{provider.bio}"
                </p>
              </CardContent>
              <CardFooter className="p-4">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <PawPrint className="mr-2 h-4 w-4" /> Contact Provider
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{provider.name}</DialogTitle>
                            <DialogDescription>Get in touch to book your session.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Email</p>
                                    <p className="font-medium">{provider.email || "Contact via dashboard"}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Phone</p>
                                    <p className="font-medium">{provider.phone || "Not provided"}</p>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
