
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, doc, getDocs, limit, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clock,
  ChevronRight,
  Sun,
  Activity,
  MessageSquare,
  Briefcase,
  TrendingUp,
  User,
  Dog,
  Scissors,
  GraduationCap,
  MapPin,
  Star,
  Navigation,
  Droplets,
  Heart,
  ChevronDown,
  FileText as FileTextIcon,
  Search,
  Hotel,
  ShieldCheck,
  CreditCard,
  Headphones,
  Settings,
  ArrowRight,
  ChevronLeft,
  Ticket
} from "lucide-react";

const HERO_SLIDES = [
  {
    image: "https://picsum.photos/seed/hero-pet/1200/400",
    title: "Your Pet's Happiness Our Priority",
    description: "All pet care services, products and community - in one place.",
    hint: "happy golden retriever"
  },
  {
    image: "https://picsum.photos/seed/hero-pet2/1200/400",
    title: "Expert Grooming & Training",
    description: "Book verified professionals for your furry friends today.",
    hint: "pet grooming salon"
  },
  {
    image: "https://picsum.photos/seed/hero-pet3/1200/400",
    title: "Join the Neighborhood Playzone",
    description: "Find playmates and social circles for your pets nearby.",
    hint: "dogs playing park"
  }
];

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  
  // Data State
  const [petData, setPetData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localProviders, setLocalProviders] = useState<any[]>([]);
  const [newBookings, setNewBookings] = useState<any[]>([]);

  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    if (userRole === 'owner') {
      const petRef = doc(db, "pets", user.uid);
      const unsubscribePet = onSnapshot(petRef, (docSnap) => {
        if (docSnap.exists()) {
          setPetData({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      });

      const requestsQuery = query(
        collection(db, "matchRequests"),
        where("targetOwnerId", "==", user.uid),
        where("status", "==", "pending"),
        limit(3)
      );
      const unsubscribeRequests = onSnapshot(requestsQuery, async (snapshot) => {
        const requests = await Promise.all(
          snapshot.docs.map(async (d) => {
            const data = d.data();
            const userDoc = await getDoc(doc(db, "users", data.requesterId));
            return {
              id: d.id,
              ...data,
              requesterName: userDoc.exists() ? userDoc.data().name : 'Pet Owner'
            };
          })
        );
        setPendingRequests(requests);
      });

      const bookingsQuery = query(
        collection(db, "bookings"), 
        where("ownerId", "==", user.uid),
        where("status", "==", "accepted")
      );
      const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          data.sort((a: any, b: any) => a.date.localeCompare(b.date));
          setUpcomingBooking(data[0]);
        } else {
          setUpcomingBooking(null);
        }
      });

      const fetchLocal = async () => {
        const q = query(collection(db, "service_providers"), limit(6));
        const snap = await getDocs(q);
        setLocalProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchLocal();

      return () => {
        unsubscribePet();
        unsubscribeRequests();
        unsubscribeBookings();
      };
    } else if (userRole === 'provider') {
      const providerBookingsQuery = query(
        collection(db, "bookings"),
        where("serviceProviderId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubscribeProviderBookings = onSnapshot(providerBookingsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0);
          const timeB = b.createdAt?.toDate?.() || new Date(0);
          return timeB - timeA;
        });
        setNewBookings(data.slice(0, 3));
        setLoading(false);
      });

      return () => unsubscribeProviderBookings();
    }
  }, [user, userRole]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (userRole === 'owner') {
    return (
      <div className="flex flex-col min-h-screen bg-[#FDFBF9] animate-in fade-in duration-700">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="sticky top-0 z-30 bg-[#FDFBF9]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between md:hidden border-b border-orange-100">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2" />
            <span className="text-sm font-bold truncate max-w-[150px]">{petData?.name || 'Buddy'} • {petData?.breed || 'Golden Retriever'}</span>
          </div>
          <div className="flex items-center gap-3">
             <Bell className="h-6 w-6 text-muted-foreground" />
             <Avatar className="h-8 w-8 border border-muted shadow-sm">
                <AvatarImage src={user?.photoURL || "/images/logo.png"} />
                <AvatarFallback><User /></AvatarFallback>
             </Avatar>
          </div>
        </div>

        {/* Desktop Layout Wrapper */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
          
          {/* Main Dashboard Feed (Col 1-8) */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            
            {/* Hero Section - Carousel */}
            <section className="relative rounded-[2rem] overflow-hidden aspect-[2/1] sm:aspect-[3.5/1] shadow-xl group">
              {HERO_SLIDES.map((slide, index) => (
                <div 
                  key={index}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                    index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  )}
                >
                  <Image 
                    src={slide.image} 
                    alt={slide.title} 
                    fill 
                    className="object-cover"
                    data-ai-hint={slide.hint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-6 md:px-12 text-white">
                    <h1 className="text-xl md:text-3xl font-bold font-headline max-w-md leading-tight animate-in slide-in-from-left-4 duration-700">
                      {slide.title}
                    </h1>
                    <p className="mt-2 md:mt-4 text-[10px] md:text-sm opacity-90 max-w-xs md:max-w-sm">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}

              {/* Carousel Controls */}
              <button 
                onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white/40"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-white/20 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-white/40"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Carousel Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {HERO_SLIDES.map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-white/50"
                    )}
                  />
                ))}
              </div>
              
              {/* Floating Hero Search (Desktop only) */}
              <div className="hidden md:flex absolute bottom-8 left-12 right-12 z-20 items-center bg-white rounded-2xl p-1 shadow-2xl max-w-xl mx-auto">
                <div className="flex flex-1 items-center px-3">
                  <Search className="h-5 w-5 text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    placeholder="Search for services, products or vendors..."
                    className="w-full text-slate-800 text-sm py-3 bg-transparent border-none focus:ring-0"
                  />
                </div>
                <Button className="bg-primary hover:bg-primary/90 rounded-xl px-8 font-bold h-11">Search</Button>
              </div>
            </section>

            {/* Quick Service Grid */}
            <section className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-4 overflow-x-auto no-scrollbar pb-2">
              {[
                { title: 'Match', icon: Heart, color: 'bg-red-50 text-red-500', href: '/match' },
                { title: 'Walker', icon: User, color: 'bg-green-50 text-green-500', href: '/providers?service=Walking' },
                { title: 'Training', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-500', href: '/providers?service=Training' },
                { title: 'Grooming', icon: Scissors, color: 'bg-yellow-50 text-yellow-500', href: '/providers?service=Grooming' },
                { title: 'Boarding', icon: Hotel, color: 'bg-blue-50 text-blue-500', href: '/providers?service=Boarding' },
                { title: 'Reports', icon: FileTextIcon, color: 'bg-teal-50 text-teal-500', href: '/records' },
                { title: 'Playzone', icon: Activity, color: 'bg-orange-50 text-orange-500', href: '/match' },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="group shrink-0 sm:shrink">
                  <div className="flex flex-col items-center gap-1 md:gap-2 p-1 md:p-2 rounded-2xl md:rounded-3xl transition-all hover:bg-white hover:shadow-md">
                    <div className={cn("h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg", item.color)}>
                      <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-tight md:text-[10px] text-slate-700">{item.title}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </section>

            {/* Promotional Banners */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="bg-[#2D4A22] text-white border-none rounded-[2rem] overflow-hidden p-5 md:p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-bold font-headline leading-tight">Healthy Pets Happier Lives</h3>
                  <p className="text-[10px] md:text-xs opacity-80">Book grooming, training, boarding and more.</p>
                  <Button variant="secondary" size="sm" className="rounded-xl font-bold h-8 text-[10px] md:text-xs">Explore Services <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo1/300/300" alt="Dog" width={120} height={120} className="absolute bottom-0 right-0 object-cover opacity-50 group-hover:scale-110 transition-transform md:w-[150px] md:h-[150px]" />
              </Card>

              <Card className="bg-[#E9B7CE] text-[#802D52] border-none rounded-[2rem] overflow-hidden p-5 md:p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-bold font-headline leading-tight">Every Pet Deserves Love</h3>
                  <p className="text-[10px] md:text-xs opacity-80">Join our adoption network today.</p>
                  <Button size="sm" className="bg-[#802D52] text-white rounded-xl font-bold h-8 text-[10px] md:text-xs">Explore Adoption <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo2/300/300" alt="Pets" width={120} height={120} className="absolute bottom-0 right-0 object-cover opacity-50 group-hover:scale-110 transition-transform md:w-[150px] md:h-[150px]" />
              </Card>

              <Card className="bg-[#0D2B2B] text-white border-none rounded-[2rem] overflow-hidden p-5 md:p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2">
                    <PawPrintIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <h3 className="text-lg md:text-xl font-bold font-headline leading-tight text-white">Pet Reports</h3>
                  </div>
                  <p className="text-[10px] md:text-xs opacity-80">Track health, activity, and habits.</p>
                  <Button variant="secondary" size="sm" className="rounded-xl font-bold h-8 text-[10px] md:text-xs">View Reports <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo3/300/300" alt="Reports" width={120} height={120} className="absolute bottom-0 right-0 object-cover opacity-50 group-hover:scale-110 transition-transform md:w-[150px] md:h-[150px]" />
              </Card>
            </section>

            {/* Featured Services grid */}
            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-lg md:text-xl font-bold font-headline flex items-center gap-2">
                  <PawPrintIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Featured Services
                </h2>
                <Link href="/providers" className="text-[10px] md:text-xs font-bold text-primary flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {localProviders.map((provider) => (
                  <Link key={provider.id} href={`/providers/${provider.id}`}>
                    <Card className="border-none shadow-md rounded-[1.5rem] overflow-hidden group hover:shadow-lg transition-all bg-white">
                      <div className="relative aspect-square">
                        <Image src={provider.image || "/images/logo.png"} alt={provider.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <CardContent className="p-2 md:p-3">
                        <h4 className="font-bold text-[10px] md:text-[11px] truncate text-slate-800">{provider.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                             <Star className="h-2 w-2 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />
                             <span className="text-[8px] md:text-[9px] font-bold">{provider.rating}</span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-slate-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            {/* Trust Bar */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 md:pt-8 border-t border-dashed">
              {[
                { label: 'Trusted Vendors', icon: ShieldCheck, text: 'Verified & checked' },
                { label: 'Secure Payments', icon: CreditCard, text: 'Safe transactions' },
                { label: '24/7 Support', icon: Headphones, text: "We're here for you" },
                { label: 'Happy Pets', icon: Sun, text: 'Thousands served' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                    <item.icon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight">{item.label}</p>
                    <p className="text-[7px] md:text-[8px] text-muted-foreground">{item.text}</p>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Right Desktop Sidebar (Col 9-12) */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            
            {/* User Greeting Card */}
            <Card className="border-none shadow-sm rounded-3xl p-5 md:p-6 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <Avatar className="h-12 w-12 md:h-14 md:w-14 border-2 border-primary/20 p-0.5">
                    <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/user/100/100"} className="rounded-full" />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg md:text-xl font-bold font-headline">Hello, {user?.displayName?.split(' ')[0] || 'Parent'}!</h2>
                    <p className="text-[10px] md:text-xs text-muted-foreground">A better life for your pet.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-50">
                  <Settings className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                </Button>
              </div>

              {/* Pet Switcher */}
              <div className="mt-6 md:mt-8 flex gap-3 md:gap-4 overflow-x-auto no-scrollbar">
                {[
                  { name: petData?.name || 'Buddy', breed: petData?.breed || 'Golden Retriever', meta: `${petData?.age || '2 years'} • Male`, active: true, image: petData?.avatar },
                  { name: 'Mochi', breed: 'Shih Tzu', meta: '1 year • Female', active: false, image: 'https://picsum.photos/seed/mochi/100/100' },
                ].map((pet, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-2xl border transition-all cursor-pointer min-w-[140px] md:min-w-[160px]",
                    pet.active ? "border-primary bg-primary/5 shadow-sm" : "border-slate-100 bg-slate-50/50"
                  )}>
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 rounded-xl">
                      <AvatarImage src={pet.image || "https://picsum.photos/seed/petavatar/100/100"} />
                      <AvatarFallback><Dog /></AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-[10px] md:text-[11px] font-bold truncate text-slate-800">{pet.name}</p>
                      <p className="text-[8px] md:text-[9px] text-muted-foreground truncate">{pet.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Bookings Sidebar - Ticket Style */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-base md:text-lg">Upcoming Sessions</h3>
                <Link href="/bookings" className="text-[10px] md:text-xs font-bold text-primary">View All</Link>
              </div>
              <div className="space-y-3">
                {upcomingBooking ? (
                   <Card className="relative overflow-hidden rounded-[2rem] border-none shadow-lg bg-white group cursor-pointer hover:shadow-xl transition-all">
                      <div className="absolute top-0 right-0 p-4">
                        <Ticket className="h-8 w-8 text-primary/10 -rotate-12 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Scissors className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-800">{upcomingBooking.serviceType}</h4>
                            <p className="text-[10px] font-bold text-primary">{upcomingBooking.serviceProviderName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-dashed">
                          <div className="space-y-0.5">
                            <p className="text-[8px] font-bold uppercase text-slate-400">Date</p>
                            <p className="text-[10px] font-bold text-slate-700">{upcomingBooking.date}</p>
                          </div>
                          <div className="space-y-0.5 text-right">
                            <p className="text-[8px] font-bold uppercase text-slate-400">Time</p>
                            <p className="text-[10px] font-bold text-slate-700">{upcomingBooking.time}</p>
                          </div>
                        </div>
                        
                        <Button className="w-full h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold">
                          View Session Details
                        </Button>
                      </div>
                   </Card>
                ) : (
                  <div className="py-8 text-center bg-slate-50 border-2 border-dashed rounded-[2rem] text-muted-foreground text-[10px] font-medium">
                    No active bookings scheduled.
                  </div>
                )}
              </div>
            </div>

            {/* Social Match Requests Sidebar */}
            {pendingRequests.length > 0 && (
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-base md:text-lg">Match Requests</h3>
                  <Link href="/match" className="text-[10px] md:text-xs font-bold text-primary">View All</Link>
                </div>
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <Card key={req.id} className="border-none shadow-md rounded-3xl p-4 bg-white hover:shadow-lg transition-all">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-orange-50 text-primary font-bold">
                            {req.requesterName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-800 truncate">{req.requesterName}</p>
                          <p className="text-[9px] text-muted-foreground truncate">wants to match with {req.targetPetName}</p>
                        </div>
                        <Link href="/match">
                          <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-slate-50 text-slate-400 hover:text-primary">
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Community Engagement Sidebar */}
            <Card className="bg-[#274E4A] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group shadow-lg">
               <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-bold font-headline leading-tight">Pet Parent Community</h3>
                  <p className="text-[11px] opacity-80 leading-relaxed">Join 5,000+ parents in your city for playdates and expert advice.</p>
                  <Button variant="secondary" size="sm" className="rounded-xl font-bold flex items-center gap-2 h-9 text-[11px] w-full justify-center">
                     <UsersIcon className="h-4 w-4" /> Join Discussion <ArrowRight className="h-4 w-4" />
                  </Button>
               </div>
               <Image src="https://picsum.photos/seed/community/400/400" alt="Community" width={180} height={180} className="absolute -bottom-8 -right-12 object-cover opacity-30 group-hover:scale-110 transition-transform" />
            </Card>

            {/* Recently Viewed / Tips */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-500 uppercase tracking-widest px-2">Parenting Tips</h3>
              {[
                { title: 'Training Tips for Goldens', date: '2 days ago', icon: GraduationCap },
                { title: 'Best Monsoon Diet', date: '5 days ago', icon: Activity },
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 cursor-pointer hover:border-primary/20 transition-all">
                  <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <tip.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-700">{tip.title}</p>
                    <p className="text-[8px] text-muted-foreground">{tip.date}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Render Provider Dashboard
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline flex items-center gap-2 text-slate-900">
            Business Hub, {user?.displayName?.split(' ')[0]}! <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your service schedule and grow your pet business.
          </p>
        </div>
        <Link href="/business-profile">
          <Button variant="outline" className="rounded-full bg-white shadow-sm border-none flex items-center gap-2 h-10 text-xs font-bold text-slate-700">
            <Briefcase className="h-4 w-4 text-primary" />
            <span>My Listing</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="h-1 bg-primary w-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Bookings</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">128</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
              <TrendingUp className="h-3 w-3" /> +12% this month
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="h-1 bg-yellow-400 w-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Average Rating</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">4.9/5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <div className="h-1 bg-teal-500 w-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Completion Rate</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">92%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={92} className="h-2 bg-slate-100" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Booking Requests</CardTitle>
                <CardDescription className="text-xs">New requests waiting for your approval.</CardDescription>
              </div>
              <Link href="/bookings">
                <Button variant="link" className="text-primary text-xs font-bold">View Schedule</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {newBookings.length > 0 ? (
                <div className="space-y-4">
                   {newBookings.map((req) => (
                     <div key={req.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {req.serviceType.charAt(0)}
                              </AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="font-bold text-sm text-slate-900">{req.serviceType}</p>
                              <p className="text-[10px] text-muted-foreground">{req.date} at {req.time}</p>
                           </div>
                        </div>
                        <Link href="/bookings">
                          <Button size="sm" className="h-8 text-xs font-bold px-4">Manage</Button>
                        </Link>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-2xl bg-slate-50/30">
                   <Calendar className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                   <p className="text-sm text-muted-foreground font-medium">No pending requests at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-lg bg-[#274E4A] text-white rounded-2xl overflow-hidden p-6 relative group">
             <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold">Grow Your Business</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  Top-rated providers get 3x more bookings. Complete your profile and add photos of your workspace.
                </p>
                <Link href="/business-profile">
                  <Button variant="secondary" className="w-full font-bold h-10 text-xs">Update My Listing</Button>
                </Link>
             </div>
             <Image src="https://picsum.photos/seed/business/400/400" alt="Business Growth" width={150} height={150} className="absolute -bottom-4 -right-4 opacity-20 group-hover:scale-110 transition-transform" />
          </Card>
          
          <Card className="border-none shadow-sm bg-white rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400">Business Tip</h3>
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center text-primary shrink-0">
                <Sun className="h-5 w-5" />
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Responding to requests within 1 hour increases your chances of being booked by 60%."
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PawPrintIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="5" r="2" />
      <circle cx="18" cy="9" r="2" />
      <circle cx="7" cy="9" r="2" />
      <circle cx="14" cy="5" r="2" />
      <path d="M12 13c-2 0-4 1-4 3 0 2 2 4 4 4s4-2 4-4c0-2-2-3-4-3Z" />
      <path d="M12 21c-3.1 0-6-2.3-6-5.5s2.9-5.5 6-5.5 6 2.3 6 5.5-2.9 5.5-6 5.5Z" />
    </svg>
  )
}

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
