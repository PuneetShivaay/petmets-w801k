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
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  CheckCircle2,
  ShieldCheck,
  Award,
  Zap,
  Ticket
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
      <div className="container max-w-5xl mx-auto p-8 flex justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mt-20" />
      </div>
    );
  }

  if (!provider) return null;

  return (
    <div className="container max-w-6xl mx-auto pb-20 px-4 md:px-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-8 hover:bg-white text-slate-500 font-bold">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Discover
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        {/* Left Column: Info and Gallery */}
        <div className="lg:col-span-7 space-y-8 md:space-y-12">
          <section className="relative h-[25rem] md:h-[32rem] w-full rounded-[3rem] overflow-hidden shadow-2xl border-none">
            <Image 
              src={provider.image} 
              alt={provider.name} 
              fill 
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Badge className="absolute top-8 right-8 text-sm font-bold py-2 px-6 shadow-2xl bg-white/90 backdrop-blur-md text-slate-900 border-none rounded-full" variant="secondary">
              {provider.service} Specialist
            </Badge>
            <div className="absolute bottom-8 left-8 text-white space-y-2">
               <h1 className="text-4xl md:text-5xl font-bold font-headline leading-tight">{provider.name}</h1>
               <div className="flex items-center gap-4 text-sm font-bold opacity-90">
                 <div className="flex items-center gap-1">
                   <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                   <span>{provider.rating} (5.0 Rating)</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <MapPin className="h-4 w-4 text-primary" />
                   <span>{provider.location}</span>
                 </div>
               </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             {[
               { label: 'Verified', icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
               { label: 'Top Rated', icon: Award, color: 'bg-orange-50 text-orange-600' },
               { label: 'Fast Response', icon: Zap, color: 'bg-blue-50 text-blue-600' },
             ].map((badge, i) => (
               <div key={i} className={cn("p-4 rounded-3xl flex items-center gap-3", badge.color)}>
                 <badge.icon className="h-5 w-5" />
                 <span className="text-xs font-bold uppercase tracking-wider">{badge.label}</span>
               </div>
             ))}
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold font-headline text-slate-900">About Our Services</h3>
              <div className="h-px flex-1 mx-8 bg-slate-100 hidden sm:block" />
            </div>
            <Card className="bg-white border-none shadow-sm rounded-[2rem]">
              <CardContent className="p-8">
                <p className="text-slate-600 leading-relaxed italic text-lg whitespace-pre-wrap">
                  "{provider.bio}"
                </p>
              </CardContent>
            </Card>
          </section>

          {provider.gallery && provider.gallery.length > 0 && (
            <section className="space-y-6">
              <h4 className="text-2xl font-bold font-headline flex items-center gap-3 text-slate-900">
                <ImageIcon className="h-7 w-7 text-primary" />
                Service Showcase
              </h4>
              <ScrollArea className="w-full whitespace-nowrap rounded-[2rem] pb-4">
                <div className="flex w-max space-x-6">
                  {provider.gallery.map((url, idx) => (
                    <div key={idx} className="relative w-72 h-56 sm:w-96 sm:h-72 rounded-[2rem] overflow-hidden shadow-lg group">
                      <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}
        </div>

        {/* Right Column: Redesigned Booking Ticket */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 space-y-6">
            <Card className="relative overflow-hidden rounded-[3rem] border-none shadow-2xl bg-white animate-in slide-in-from-right-8 duration-700">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Ticket className="h-32 w-32 -rotate-12" />
              </div>
              
              <CardHeader className="bg-slate-50/50 border-b border-dashed p-8">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <CalendarIcon className="h-7 w-7" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold font-headline">Schedule Session</CardTitle>
                    <CardDescription className="text-sm font-bold text-primary">{provider.service} Appointment</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400">1. Preferred Date</label>
                  <div className="flex justify-center bg-slate-50/50 rounded-3xl p-2 border border-slate-100">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date()}
                      className="rounded-3xl border-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    2. Arrival Time
                  </label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="w-full h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-700">
                      <SelectValue placeholder="Choose a time" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-xl">
                      {TIME_SLOTS.map(slot => (
                        <SelectItem key={slot} value={slot} className="font-bold py-3">{slot}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 space-y-3">
                  <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Summary</p>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-800 leading-snug">
                        {provider.name}
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        {selectedDate ? format(selectedDate, 'EEEE, MMM do') : '...'} • {selectedTime}
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full h-16 text-lg font-bold shadow-xl rounded-2xl bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                  onClick={handleBookSession}
                  disabled={isBooking || !selectedDate}
                >
                  {isBooking ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : "Confirm & Pay Later"}
                </Button>
                
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Secure Professional Care
                </p>
              </CardContent>
            </Card>

            <div className="bg-[#2D4A22] text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                  <h4 className="text-xl font-bold font-headline">Safety First 🧡</h4>
                  <p className="text-xs opacity-80 leading-relaxed font-medium">
                    All PetMets providers carry professional insurance and are trained in pet first aid. Your pet's safety is our top priority.
                  </p>
               </div>
               <ShieldCheck className="absolute -bottom-4 -right-4 h-24 w-24 opacity-10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
