
"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PawPrint, Star, Search, MapPin, Mail, Loader2, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  userId: string;
  name: string;
  service: string;
  bio: string;
  location: string;
  image: string;
  gallery?: string[];
  rating: number;
  email?: string;
  phone?: string;
  createdAt: any;
}

export default function ServiceProvidersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  
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

  const handleBookSession = async (provider: Provider) => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to book a session." });
      return;
    }

    setIsBooking(provider.id);
    try {
      const bookingsColRef = collection(db, "users", user.uid, "bookings");
      
      // Simple logic: Book for 3 days from now by default for this MVP demo
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() + 3);

      await addDoc(bookingsColRef, {
        serviceProviderId: provider.id,
        serviceProviderName: provider.name,
        serviceType: provider.service,
        status: "pending",
        date: bookingDate.toISOString().split('T')[0],
        time: "10:00 AM",
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Booking Requested!",
        description: `Your session with ${provider.name} has been scheduled for ${bookingDate.toLocaleDateString()}.`,
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast({ variant: "destructive", title: "Booking Failed", description: "Could not create the booking. Please try again." });
    } finally {
      setIsBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row text-center sm:text-left">
        <p className="text-muted-foreground max-w-2xl">Browse profiles of expert pet walkers, groomers, trainers, and boarding facilities. View galleries and book appointments directly.</p>
      </div>

      <Card className="shadow-sm">
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
                <SelectItem value="Walking">Pet Walkers</SelectItem>
                <SelectItem value="Grooming">Pet Groomers</SelectItem>
                <SelectItem value="Training">Pet Trainers</SelectItem>
                <SelectItem value="Boarding">Pet Boarding</SelectItem>
                <SelectItem value="Photography">Pet Photography</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-md"><Skeleton className="h-52 w-full" /><CardContent className="p-4"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))
        ) : filteredProviders.length === 0 ? (
          <div className="col-span-full text-center py-24 bg-card rounded-lg border-2 border-dashed">
            <PawPrint className="mx-auto h-16 w-16 text-muted-foreground/20" />
            <p className="mt-4 text-lg font-medium text-muted-foreground">No matching providers found</p>
            <Button variant="link" onClick={() => { setSearchTerm(""); setServiceFilter("all"); }}>Clear filters</Button>
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <Card key={provider.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow border-none bg-card">
              <div className="relative h-56 w-full">
                <Image 
                  src={provider.image} 
                  alt={provider.name} 
                  fill 
                  className="object-cover"
                />
                <Badge className="absolute top-3 right-3 shadow-lg" variant="secondary">{provider.service}</Badge>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xl font-headline">{provider.name}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  <span className="truncate">{provider.location}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <div className="flex items-center gap-1 text-sm mb-3">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{provider.rating}</span>
                  <span className="text-muted-foreground">(5.0)</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 italic leading-relaxed">
                  "{provider.bio}"
                </p>
                {provider.gallery && provider.gallery.length > 0 && (
                   <div className="mt-4 flex items-center gap-1 text-xs text-primary font-medium">
                      <ImageIcon className="h-3 w-3" />
                      {provider.gallery.length} Service Photos
                   </div>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="w-full bg-accent hover:bg-accent/90">
                            <PawPrint className="mr-2 h-4 w-4" /> View Details & Book
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                        <ScrollArea className="flex-1">
                          <div className="p-6">
                            <DialogHeader>
                                <div className="flex items-center justify-between mb-4">
                                  <DialogTitle className="text-2xl font-headline">{provider.name}</DialogTitle>
                                  <Badge>{provider.service}</Badge>
                                </div>
                                <DialogDescription className="text-base text-foreground/80 leading-relaxed italic border-l-4 border-primary pl-4 py-2 bg-muted/30">
                                    "{provider.bio}"
                                </DialogDescription>
                            </DialogHeader>

                            {provider.gallery && provider.gallery.length > 0 && (
                                <div className="mt-8">
                                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-primary" />
                                        Service Showcase
                                    </h4>
                                    <ScrollArea className="w-full whitespace-nowrap rounded-md">
                                        <div className="flex w-max space-x-4 p-1">
                                            {provider.gallery.map((url, idx) => (
                                                <div key={idx} className="relative w-64 h-48 rounded-lg overflow-hidden border shadow-sm">
                                                    <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>
                            )}

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                    <Mail className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
                                        <p className="font-medium">{provider.email || "Contact via dashboard"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                    <MapPin className="h-6 w-6 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Service Location</p>
                                        <p className="font-medium">{provider.location}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <Button 
                                  className="w-full sm:w-auto px-8" 
                                  onClick={() => handleBookSession(provider)}
                                  disabled={isBooking === provider.id}
                                >
                                  {isBooking === provider.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                  Book a Session
                                </Button>
                            </div>
                          </div>
                        </ScrollArea>
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
