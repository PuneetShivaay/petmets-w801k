
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
  Ticket,
  Users as UsersIcon
} from "lucide-react";

const HERO_SLIDES = [
  {
    image: "https://picsum.photos/seed/hero-pet/1200/400",
    title: "Join the Neighborhood Playzone",
    description: "Find playmates and social circles for your pets nearby.",
    hint: "dogs playing park"
  },
  {
    image: "https://picsum.photos/seed/hero-pet2/1200/400",
    title: "Expert Grooming & Training",
    description: "Book verified professionals for your furry friends today.",
    hint: "pet grooming salon"
  },
  {
    image: "https://picsum.photos/seed/hero-pet3/1200/400",
    title: "Your Pet's Happiness Our Priority",
    description: "All pet care services, products and community - in one place.",
    hint: "happy golden retriever"
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
            <section className="relative rounded-[3rem] overflow-hidden aspect-[2/1] sm:aspect-[3/1] shadow-xl group">
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
                  <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-6 md:px-12 text-white">
                    <h1 className="text-2xl md:text-4xl font-bold font-headline max-w-2xl leading-tight animate-in slide-in-from-left-4 duration-700">
                      {slide.title}
                    </h1>
                    <p className="mt-2 md:mt-4 text-xs md:text-sm opacity-90 max-w-sm md:max-w-md">
                      {slide.description}
                    </p>
                    
                    {/* Integrated Hero Search */}
                    <div className="mt-8 flex items-center bg-white rounded-full p-1 shadow-2xl max-w-xl">
                      <div className="flex flex-1 items-center px-4">
                        <Search className="h-5 w-5 text-slate-400 mr-2" />
                        <input 
                          type="text" 
                          placeholder="Search for services, products or vendors..."
                          className="w-full text-slate-800 text-xs py-3 bg-transparent border-none focus:ring-0"
                        />
                      </div>
                      <Button className="bg-primary hover:bg-primary/90 rounded-full px-8 font-bold h-11 text-xs">Search</Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Carousel Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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
            </section>

            {/* Quick Service Grid */}
            <section className="grid grid-cols-4 sm:grid-cols-7 gap-4 md:gap-6 px-2">
              {[
                { title: 'MATCH', icon: Heart, color: 'text-red-500', href: '/match' },
                { title: 'WALKER', icon: User, color: 'text-green-500', href: '/providers?service=Walking' },
                { title: 'TRAINING', icon: GraduationCap, color: 'text-indigo-500', href: '/providers?service=Training' },
                { title: 'GROOMING', icon: Scissors, color: 'text-yellow-500', href: '/providers?service=Grooming' },
                { title: 'BOARDING', icon: Hotel, color: 'text-blue-500', href: '/providers?service=Boarding' },
                { title: 'REPORTS', icon: FileTextIcon, color: 'text-teal-500', href: '/records' },
                { title: 'PLAYZONE', icon: Activity, color: 'text-orange-500', href: '/match' },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="group flex flex-col items-center gap-3">
                  <div className={cn("h-12 w-12 md:h-14 md:w-14 rounded-2xl flex items-center justify-center bg-white shadow-sm border border-slate-100 transition-all duration-300 group-hover:scale-110 group-hover:shadow-md", item.color)}>
                    <item.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">{item.title}</p>
                </Link>
              ))}
            </section>

            {/* Promotional Banners */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#466935] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-lg min-h-[160px]">
                <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-bold font-headline leading-tight">Healthy Pets Happier Lives</h3>
                  <p className="text-[10px] opacity-80 max-w-[180px]">Book grooming, training, boarding and more.</p>
                  <Button variant="secondary" size="sm" className="rounded-full font-bold h-8 text-[10px] bg-white text-[#466935]">Explore Services <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo1/300/300" alt="Dog" width={140} height={140} className="absolute bottom-0 right-0 object-cover opacity-60 group-hover:scale-110 transition-transform" />
              </Card>

              <Card className="bg-[#F8D2E2] text-[#802D52] border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-lg min-h-[160px]">
                <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-bold font-headline leading-tight">Every Pet Deserves Love</h3>
                  <p className="text-[10px] opacity-80">Join our adoption network today.</p>
                  <Button size="sm" className="bg-[#802D52] text-white rounded-full font-bold h-8 text-[10px]">Explore Adoption <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo2/300/300" alt="Pets" width={140} height={140} className="absolute bottom-0 right-0 object-cover opacity-60 group-hover:scale-110 transition-transform" />
              </Card>

              <Card className="bg-[#0D2B2B] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-lg min-h-[160px]">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <PawPrintIcon className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-bold font-headline leading-tight text-white">Pet Reports</h3>
                  </div>
                  <p className="text-[10px] opacity-80">Track health, activity, and habits.</p>
                  <Button variant="secondary" size="sm" className="rounded-full font-bold h-8 text-[10px] bg-white text-[#0D2B2B]">View Reports <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo3/300/300" alt="Reports" width={140} height={140} className="absolute bottom-0 right-0 object-cover opacity-60 group-hover:scale-110 transition-transform" />
              </Card>
            </section>

            {/* Featured Services grid */}
            <section className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                  <PawPrintIcon className="h-6 w-6 text-primary" /> Featured Services
                </h2>
                <Link href="/providers" className="text-xs font-bold text-primary flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {localProviders.map((provider) => (
                  <Link key={provider.id} href={`/providers/${provider.id}`}>
                    <Card className="border-none shadow-md rounded-[1.5rem] overflow-hidden group hover:shadow-lg transition-all bg-white">
                      <div className="relative aspect-square">
                        <Image src={provider.image || "/images/logo.png"} alt={provider.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <CardContent className="p-3">
                        <h4 className="font-bold text-[11px] truncate text-slate-800">{provider.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                             <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                             <span className="text-[10px] font-bold">{provider.rating}</span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-slate-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Right Desktop Sidebar (Col 9-12) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* User Greeting & Pet Card */}
            <Card className="border-none shadow-sm rounded-[2.5rem] p-6 bg-white space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/10 p-0.5">
                    <AvatarImage src={user?.photoURL || "https://picsum.photos/seed/user/100/100"} className="rounded-full" />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-bold font-headline text-slate-900">Hello, {user?.displayName?.split(' ')[0] || 'Puneet'}!</h2>
                    <p className="text-[11px] text-muted-foreground">A better life for your pet.</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-50">
                  <Settings className="h-4 w-4 text-slate-400" />
                </Button>
              </div>

              {/* Active Pet Identity */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Your Pet's Profile</h3>
                <Link href="/pet-profile">
                  <div className="flex items-center gap-4 p-4 rounded-3xl border border-slate-100 bg-slate-50/50 group hover:border-primary/20 transition-all">
                    <Avatar className="h-12 w-12 rounded-2xl overflow-hidden">
                      <AvatarImage src={petData?.avatar || "https://picsum.photos/seed/petavatar/100/100"} className="object-cover" />
                      <AvatarFallback><Dog /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-bold truncate text-slate-800">{petData?.name || 'Buddy2'}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{petData?.breed || 'Golden Retriever'} • {petData?.age || '3 years'}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </div>
            </Card>

            {/* Upcoming Bookings Sidebar - Ticket Style */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-base text-slate-900">Upcoming Sessions</h3>
                <Link href="/bookings" className="text-[10px] font-bold text-primary uppercase tracking-widest">View All</Link>
              </div>
              <div className="space-y-4">
                {upcomingBooking ? (
                   <Card className="relative overflow-hidden rounded-[2.5rem] border-none shadow-lg bg-white group cursor-pointer hover:shadow-xl transition-all">
                      <div className="absolute top-0 right-0 p-6 opacity-5">
                        <Ticket className="h-12 w-12 text-primary/10 -rotate-12 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-7 space-y-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Scissors className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base text-slate-800">{upcomingBooking.serviceType}</h4>
                            <p className="text-xs font-bold text-red-500">{upcomingBooking.serviceProviderName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-dashed">
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Date</p>
                            <p className="text-xs font-bold text-slate-700">{upcomingBooking.date}</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Time</p>
                            <p className="text-xs font-bold text-slate-700">{upcomingBooking.time}</p>
                          </div>
                        </div>
                        
                        <Button className="w-full h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-widest">
                          View Details
                        </Button>
                      </div>
                   </Card>
                ) : (
                  <div className="py-12 text-center bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-muted-foreground text-[11px] font-medium">
                    No active bookings scheduled.
                  </div>
                )}
              </div>
            </div>

            {/* Community Engagement Sidebar */}
            <Card className="bg-[#274E4A] text-white border-none rounded-[2.5rem] overflow-hidden p-8 relative group shadow-xl">
               <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-bold font-headline leading-tight">Pet Parent Community</h3>
                  <p className="text-xs opacity-80 leading-relaxed">Join 5,000+ parents in your city for playdates and expert advice.</p>
                  <Button variant="secondary" size="sm" className="rounded-2xl font-bold flex items-center gap-2 h-10 text-xs w-full justify-center bg-white text-[#274E4A] hover:bg-white/90">
                     <UsersIcon className="h-4 w-4" /> Join Discussion <ArrowRight className="h-4 w-4" />
                  </Button>
               </div>
            </Card>

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <div className="h-1.5 bg-primary w-full" />
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
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <div className="h-1.5 bg-yellow-400 w-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Average Rating</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">4.9/5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <div className="h-1.5 bg-teal-500 w-full" />
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Completion Rate</CardDescription>
            <CardTitle className="text-3xl font-bold text-slate-900">92%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={92} className="h-2.5 bg-slate-100" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
            <CardHeader className="flex flex-row items-center justify-between p-8">
              <div>
                <CardTitle className="text-xl">Recent Booking Requests</CardTitle>
                <CardDescription className="text-xs">New requests waiting for your approval.</CardDescription>
              </div>
              <Link href="/bookings">
                <Button variant="link" className="text-primary text-xs font-bold">View Schedule</Button>
              </Link>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              {newBookings.length > 0 ? (
                <div className="space-y-4">
                   {newBookings.map((req) => (
                     <div key={req.id} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-4">
                           <Avatar className="h-11 w-11">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {req.serviceType.charAt(0)}
                              </AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="font-bold text-sm text-slate-900">{req.serviceType}</p>
                              <p className="text-[10px] text-muted-foreground">{req.date} at {req.time}</p>
                           </div>
                        </div>
                        <Link href="/bookings">
                          <Button size="sm" className="h-9 text-xs font-bold px-5 rounded-xl">Manage</Button>
                        </Link>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-[2rem] border-slate-100 bg-slate-50/30">
                   <Calendar className="mx-auto h-14 w-14 text-slate-200 mb-4" />
                   <p className="text-sm text-muted-foreground font-medium">No pending requests at the moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-lg bg-[#274E4A] text-white rounded-[2.5rem] overflow-hidden p-8 relative group">
             <div className="relative z-10 space-y-6">
                <h3 className="text-xl font-bold font-headline">Grow Your Business</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  Top-rated providers get 3x more bookings. Complete your profile and add photos of your workspace.
                </p>
                <Link href="/business-profile">
                  <Button variant="secondary" className="w-full font-bold h-12 rounded-2xl text-xs bg-white text-[#274E4A]">Update My Listing</Button>
                </Link>
             </div>
             <Image src="https://picsum.photos/seed/business/400/400" alt="Business Growth" width={180} height={180} className="absolute -bottom-6 -right-6 opacity-20 group-hover:scale-110 transition-transform" />
          </Card>
          
          <Card className="border-none shadow-sm bg-white rounded-[2rem] p-7 space-y-5">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400">Business Tip</h3>
            <div className="flex gap-4">
              <div className="h-11 w-11 rounded-2xl bg-orange-50 flex items-center justify-center text-primary shrink-0">
                <Sun className="h-6 w-6" />
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
