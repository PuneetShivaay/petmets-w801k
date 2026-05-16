
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PawPrint, Star, Search, MapPin, Mail, Loader2, Image as ImageIcon, Calendar as CalendarIcon, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

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

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
];

export default function ServiceProvidersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Booking states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");

  const selectedProviderId = searchParams.get("view");
  const selectedProvider = useMemo(() => 
    providers.find(p => p.id === selectedProviderId), 
    [providers, selectedProviderId]
  );

  useEffect(() => {
    const q = query(collection(db, "service_providers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setProviders(data);
      setLoading(false);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'service_providers',
        operation: 'list'
      }));
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

  const handleOpenDetails = (providerId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", providerId);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseDetails = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("view");
    router.back();
    // Reset booking selection on close
    setSelectedDate(new Date());
    setSelectedTime("10:00 AM");
  };

  const handleBookSession = async (provider: Provider) => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to book a session." });
      return;
    }

    if (!selectedDate) {
      toast({ variant: "destructive", title: "Date Required", description: "Please select a date for your booking." });
      return;
    }

    setIsBooking(provider.id);
    const bookingsColRef = collection(db, "bookings");

    const bookingData = {
      ownerId: user.uid,
      serviceProviderId: provider.id,
      serviceProviderName: provider.name,
      serviceType: provider.service,
      status: "pending",
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      createdAt: serverTimestamp(),
    };

    addDoc(bookingsColRef, bookingData)
      .then(() => {
        toast({
          title: "Booking Requested!",
          description: `Your session with ${provider.name} has been scheduled for ${format(selectedDate, 'PPP')} at ${selectedTime}.`,
        });
        handleCloseDetails();
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'bookings',
          operation: 'create',
          requestResourceData: bookingData,
        }));
      })
      .finally(() => {
        setIsBooking(null);
      });
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
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full bg-accent hover:bg-accent/90" onClick={() => handleOpenDetails(provider.id)}>
                    <PawPrint className="mr-2 h-4 w-4" /> View Details & Book
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!selectedProvider} onOpenChange={(open) => !open && handleCloseDetails()}>
        <DialogContent className="max-w-3xl w-[95vw] sm:w-full max-h-[90vh] flex flex-col p-0 overflow-hidden">
            {selectedProvider && (
              <>
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 sm:p-6 pb-24 sm:pb-28">
                    <DialogHeader className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <DialogTitle className="text-2xl font-headline">{selectedProvider.name}</DialogTitle>
                          <Badge className="w-fit">{selectedProvider.service}</Badge>
                        </div>
                        <DialogDescription className="text-base text-foreground/80 leading-relaxed italic border-l-4 border-primary pl-4 py-2 bg-muted/30">
                            "{selectedProvider.bio}"
                        </DialogDescription>
                    </DialogHeader>

                    {selectedProvider.gallery && selectedProvider.gallery.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <ImageIcon className="h-5 w-5 text-primary" />
                                Service Showcase
                            </h4>
                            <ScrollArea className="w-full whitespace-nowrap rounded-md pb-4">
                                <div className="flex w-max space-x-4 p-1">
                                    {selectedProvider.gallery.map((url, idx) => (
                                        <div key={idx} className="relative w-48 h-36 sm:w-64 sm:h-48 rounded-lg overflow-hidden border shadow-sm">
                                            <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                    )}

                    <div className="mt-8 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <Mail className="h-6 w-6 text-primary" />
                                <div className="min-w-0">
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email Address</p>
                                    <p className="font-medium truncate">{selectedProvider.email || "Contact via dashboard"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                                <MapPin className="h-6 w-6 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Service Location</p>
                                    <p className="font-medium">{selectedProvider.location}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-8">
                            <h4 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-primary" />
                                Schedule Your Session
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                <div className="flex justify-center border rounded-lg p-2 bg-background shadow-sm">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate}
                                        onSelect={setSelectedDate}
                                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                    />
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-primary" />
                                            Preferred Time
                                        </label>
                                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Choose a time" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TIME_SLOTS.map(slot => (
                                                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Appointment Summary</p>
                                        <p className="text-sm">
                                            Booking for <span className="font-bold">{selectedDate ? format(selectedDate, 'PPPP') : '...'}</span> at <span className="font-bold">{selectedTime}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                </ScrollArea>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <Button 
                      className="w-full sm:w-auto sm:float-right px-8 py-6 text-lg" 
                      onClick={() => handleBookSession(selectedProvider)}
                      disabled={isBooking === selectedProvider.id || !selectedDate}
                    >
                      {isBooking === selectedProvider.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirm Booking
                    </Button>
                </div>
              </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
