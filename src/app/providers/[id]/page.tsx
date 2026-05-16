
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/contexts/loading-context";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  Mail, 
  Calendar as CalendarIcon, 
  Clock, 
  Image as ImageIcon, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";

interface Provider {
  id: string;
  name: string;
  service: string;
  bio: string;
  location: string;
  image: string;
  gallery?: string[];
  rating: number;
  email?: string;
}

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
];

export default function ProviderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hideLoading } = useLoading();
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("10:00 AM");

  useEffect(() => {
    hideLoading();
    const fetchProvider = async () => {
      if (!params.id) return;
      try {
        const docRef = doc(db, "service_providers", params.id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProvider({ id: docSnap.id, ...docSnap.data() } as Provider);
        } else {
          toast({ variant: "destructive", title: "Provider not found" });
          router.push("/providers");
        }
      } catch (error) {
        console.error("Error fetching provider:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [params.id, router, toast, hideLoading]);

  const handleBookSession = async () => {
    if (!user || !provider) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please log in to book a session." });
      return;
    }

    if (!selectedDate) {
      toast({ variant: "destructive", title: "Date Required", description: "Please select a date for your booking." });
      return;
    }

    setIsBooking(true);
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

    addDoc(collection(db, "bookings"), bookingData)
      .then(() => {
        toast({
          title: "Booking Requested!",
          description: `Your session with ${provider.name} has been scheduled.`,
        });
        router.push("/bookings");
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'bookings',
          operation: 'create',
          requestResourceData: bookingData,
        }));
      })
      .finally(() => {
        setIsBooking(false);
      });
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 space-y-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mt-20" />
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className="container max-w-5xl mx-auto pb-20">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Info and Gallery */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden shadow-xl border">
            <Image 
              src={provider.image} 
              alt={provider.name} 
              fill 
              className="object-cover"
              priority
            />
            <Badge className="absolute top-4 right-4 text-lg py-1 px-4 shadow-2xl" variant="secondary">
              {provider.service}
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-bold font-headline">{provider.name}</h1>
              <div className="flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full w-fit">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{provider.rating}</span>
                <span className="text-muted-foreground">(5.0 Rating)</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{provider.location}</span>
              </div>
              {provider.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <span className="truncate max-w-[200px] sm:max-w-none">{provider.email}</span>
                </div>
              )}
            </div>

            <Card className="bg-muted/30 border-none shadow-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">About Our Services</h3>
                <p className="text-foreground/80 leading-relaxed italic whitespace-pre-wrap">
                  "{provider.bio}"
                </p>
              </CardContent>
            </Card>
          </div>

          {provider.gallery && provider.gallery.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xl font-bold flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                Service Showcase
              </h4>
              <ScrollArea className="w-full whitespace-nowrap rounded-xl pb-4">
                <div className="flex w-max space-x-4">
                  {provider.gallery.map((url, idx) => (
                    <div key={idx} className="relative w-64 h-48 sm:w-80 sm:h-60 rounded-xl overflow-hidden border shadow-md">
                      <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Right Column: Booking Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 shadow-2xl border-primary/20">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarIcon className="h-5 w-5 text-primary" />
                Schedule Session
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">1. Select Date</label>
                <div className="flex justify-center border rounded-xl p-2 bg-background">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  2. Preferred Time
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map(slot => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-primary/10 p-4 rounded-xl space-y-2">
                <p className="text-xs text-primary font-bold uppercase tracking-tighter">Booking Summary</p>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-1" />
                  <p className="text-sm leading-snug">
                    <span className="font-bold">{provider.name}</span> for <span className="font-bold">{selectedDate ? format(selectedDate, 'PPPP') : '...'}</span> at <span className="font-bold">{selectedTime}</span>
                  </p>
                </div>
              </div>

              <Button 
                className="w-full h-14 text-lg font-bold shadow-lg" 
                onClick={handleBookSession}
                disabled={isBooking || !selectedDate}
              >
                {isBooking ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Confirm Booking"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You'll be notified once the provider accepts your request.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
