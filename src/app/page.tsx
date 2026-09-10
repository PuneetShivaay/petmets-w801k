
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, doc, getDocs, limit } from "firebase/firestore";
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
  ArrowRight
} from "lucide-react";

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  
  // Data State
  const [petData, setPetData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localProviders, setLocalProviders] = useState<any[]>([]);
  const [newBookings, setNewBookings] = useState<any[]>([]);

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
        where("status", "==", "pending")
      );
      const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => setPendingRequests(snapshot.size));

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
            <span className="text-sm font-bold">{petData?.name || 'Buddy'} • {petData?.breed || 'Golden Retriever'}</span>
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
            
            {/* Hero Section */}
            <section className="relative rounded-[2rem] overflow-hidden aspect-[2.5/1] sm:aspect-[3.5/1] shadow-xl">
              <Image 
                src="https://picsum.photos/seed/hero-pet/1200/400" 
                alt="Pet Wellness" 
                fill 
                className="object-cover"
                data-ai-hint="happy pet owner"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-6 md:px-12 text-white">
                <h1 className="text-2xl md:text-4xl font-bold font-headline max-w-md leading-tight">
                  Your Pet's Happiness Our Priority
                </h1>
                <p className="mt-2 md:mt-4 text-xs md:text-base opacity-90 max-w-sm">
                  All pet care services, products and community - in one place.
                </p>
                
                {/* Hero Search Bar */}
                <div className="mt-6 md:mt-8 flex items-center bg-white rounded-2xl p-1 shadow-lg max-w-xl">
                  <div className="flex flex-1 items-center px-3">
                    <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-400 mr-2" />
                    <input 
                      type="text" 
                      placeholder="Search for services, products or vendors..."
                      className="w-full text-slate-800 text-xs md:text-sm py-2 md:py-3 bg-transparent border-none focus:ring-0"
                    />
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 rounded-xl px-4 md:px-8 font-bold h-9 md:h-11">Search</Button>
                </div>
              </div>
            </section>

            {/* Quick Service Grid */}
            <section className="grid grid-cols-4 sm:grid-cols-7 gap-2 md:gap-4">
              {[
                { title: 'Match', icon: Heart, color: 'bg-red-50 text-red-500', href: '/match', desc: 'Find perfect companion' },
                { title: 'Walker', icon: User, color: 'bg-green-50 text-green-500', href: '/providers?service=Walking', desc: 'Safe & trusted walkers' },
                { title: 'Training', icon: GraduationCap, color: 'bg-indigo-50 text-indigo-500', href: '/providers?service=Training', desc: 'Better behavior bond' },
                { title: 'Grooming', icon: Scissors, color: 'bg-yellow-50 text-yellow-500', href: '/providers?service=Grooming', desc: 'Clean, fresh & happy' },
                { title: 'Boarding', icon: Hotel, color: 'bg-blue-50 text-blue-500', href: '/providers?service=Boarding', desc: 'Safe stays, loving care' },
                { title: 'Reports', icon: FileTextIcon, color: 'bg-teal-50 text-teal-500', href: '/records', desc: 'Health, activity & more' },
                { title: 'Playzone', icon: Activity, color: 'bg-orange-50 text-orange-500', href: '/match', desc: 'Play, socialize, friends' },
              ].map((item, i) => (
                <Link key={i} href={item.href} className="group">
                  <div className="flex flex-col items-center gap-1 md:gap-2 p-1 md:p-2 rounded-2xl md:rounded-3xl transition-all hover:bg-white hover:shadow-md">
                    <div className={cn("h-10 w-10 md:h-16 md:w-16 rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", item.color)}>
                      <item.icon className="h-5 w-5 md:h-8 md:w-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-tight md:text-xs">{item.title}</p>
                      <p className="hidden sm:block text-[7px] text-muted-foreground mt-0.5 leading-tight">{item.desc}</p>
                    </div>
                    <ArrowRight className="h-3 w-3 text-slate-300 mt-0.5 opacity-0 group-hover:opacity-100" />
                  </div>
                </Link>
              ))}
            </section>

            {/* Promotional Banners */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <Card className="bg-[#2D4A22] text-white border-none rounded-[2rem] overflow-hidden p-5 md:p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-bold font-headline leading-tight">Healthy Pets Happier Lives</h3>
                  <p className="text-[10px] md:text-xs opacity-80">Book grooming, training, boarding and more - all in one place.</p>
                  <Button variant="secondary" size="sm" className="rounded-xl font-bold h-8 text-[10px] md:text-xs">Explore Services <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo1/300/300" alt="Dog" width={120} height={120} className="absolute bottom-0 right-0 object-cover opacity-50 group-hover:scale-110 transition-transform md:w-[150px] md:h-[150px]" />
              </Card>

              <Card className="bg-[#E9B7CE] text-[#802D52] border-none rounded-[2rem] overflow-hidden p-5 md:p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-bold font-headline leading-tight">Every Pet Deserves Love</h3>
                  <p className="text-[10px] md:text-xs opacity-80">Join our adoption network and find a friend.</p>
                  <Button size="sm" className="bg-[#802D52] text-white rounded-xl font-bold h-8 text-[10px] md:text-xs">Explore Store <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo2/300/300" alt="Pets" width={120} height={120} className="absolute bottom-0 right-0 object-cover opacity-50 group-hover:scale-110 transition-transform md:w-[150px] md:h-[150px]" />
              </Card>

              <Card className="bg-[#0D2B2B] text-white border-none rounded-[2rem] overflow-hidden p-5 md:p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2">
                    <PawPrintIcon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    <h3 className="text-lg md:text-xl font-bold font-headline leading-tight text-white">Pet Reports</h3>
                  </div>
                  <p className="text-[10px] md:text-xs opacity-80">Track health, activity, habits & more.</p>
                  <Button variant="secondary" size="sm" className="rounded-xl font-bold h-8 text-[10px] md:text-xs">View Reports <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <Image src="https://picsum.photos/seed/promo3/300/300" alt="Reports" width={120} height={120} className="absolute bottom-0 right-0 object-cover opacity-50 group-hover:scale-110 transition-transform md:w-[150px] md:h-[150px]" />
              </Card>
            </section>

            {/* Featured Services Row */}
            <section className="space-y-4 md:space-y-6">
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl md:text-2xl font-bold font-headline flex items-center gap-2">
                  <PawPrintIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" /> Featured Services
                </h2>
                <Link href="/providers" className="text-xs font-bold text-primary flex items-center gap-1">
                  View All <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                {localProviders.map((provider) => (
                  <Link key={provider.id} href={`/providers/${provider.id}`}>
                    <Card className="border-none shadow-md rounded-[1.5rem] overflow-hidden group hover:shadow-lg transition-all">
                      <div className="relative aspect-square">
                        <Image src={provider.image || "/images/logo.png"} alt={provider.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <CardContent className="p-2 md:p-3">
                        <h4 className="font-bold text-[10px] md:text-xs truncate">{provider.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1">
                             <Star className="h-2 w-2 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />
                             <span className="text-[8px] md:text-[10px] font-bold">{provider.rating}</span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-slate-300" />
                        </div>
                        <p className="text-[8px] md:text-[9px] text-muted-foreground mt-1">From ₹{Math.floor(Math.random() * 2000) + 499}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            {/* Footer Trust Bar */}
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
                  { name: 'Mochi', breed: 'Shih Tzu', meta: '1 year • Female', active: false, image: 'https://picsum.photos/seed/pet2/100/100' },
                ].map((pet, i) => (
                  <div key={i} className={cn(
                    "flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-2xl border transition-all cursor-pointer min-w-[140px] md:min-w-[160px]",
                    pet.active ? "border-primary bg-primary/5" : "border-slate-100 bg-slate-50/50"
                  )}>
                    <Avatar className="h-8 w-8 md:h-10 md:w-10 rounded-xl">
                      <AvatarImage src={pet.image || "https://picsum.photos/seed/buddy/100/100"} />
                      <AvatarFallback><Dog /></AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-[10px] md:text-xs font-bold truncate">{pet.name}</p>
                      <p className="text-[8px] md:text-[9px] text-muted-foreground truncate">{pet.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Bookings Sidebar */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-base md:text-lg">Upcoming Bookings</h3>
                <Link href="/bookings" className="text-[10px] md:text-xs font-bold text-primary">View All</Link>
              </div>
              <div className="space-y-3 md:space-y-4">
                {upcomingBooking ? (
                   <Card className="border-none shadow-md rounded-3xl p-3 md:p-4 flex gap-3 md:gap-4 bg-white relative overflow-hidden group">
                      <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl overflow-hidden flex-shrink-0">
                         <Image src="https://picsum.photos/seed/booking/200/200" alt="Booking" fill className="object-cover" />
                      </div>
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center justify-between">
                           <h4 className="text-xs md:text-sm font-bold text-slate-800 truncate max-w-[80px] md:max-w-none">{upcomingBooking.serviceType}</h4>
                           <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[7px] md:text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-tighter md:tracking-widest">Confirmed</Badge>
                        </div>
                        <p className="text-[9px] md:text-[10px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-2 w-2 md:h-3 md:w-3" /> Today • 5:00 PM
                        </p>
                        <p className="text-[10px] md:text-xs font-bold text-primary mt-1 md:mt-2">{upcomingBooking.serviceProviderName}</p>
                      </div>
                   </Card>
                ) : (
                  <div className="py-6 md:py-8 text-center bg-slate-50 border-2 border-dashed rounded-3xl text-muted-foreground text-[10px] md:text-xs font-medium">
                    No bookings scheduled.
                  </div>
                )}
              </div>
            </div>

            {/* Promo Banner 2 */}
            <Card className="bg-[#FFF4ED] border-none rounded-[2rem] overflow-hidden p-5 md:p-6 relative group cursor-pointer shadow-sm">
               <div className="relative z-10 space-y-3 md:space-y-4 max-w-[70%]">
                  <div className="h-8 w-8 md:h-10 md:w-10 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                    <PawPrintIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold font-headline leading-tight text-slate-800">New to PetMets?</h3>
                  <p className="text-[9px] md:text-[10px] text-slate-600">Get <span className="text-primary font-bold">50% off</span> on first service!</p>
                  <Button size="sm" className="bg-primary rounded-xl font-bold px-4 md:px-6 h-8 text-[10px] md:text-xs">Explore Now</Button>
               </div>
               <Image src="https://picsum.photos/seed/promo4/400/400" alt="Special Offer" width={140} height={140} className="absolute -bottom-4 -right-8 object-cover group-hover:scale-110 transition-transform md:w-[180px] md:h-[180px]" />
            </Card>

            {/* Recently Viewed Sidebar */}
            <div className="space-y-3 md:space-y-4">
               <div className="flex items-center justify-between px-2">
                  <h3 className="font-bold text-base md:text-lg">Recently Viewed</h3>
                  <Link href="/providers" className="text-[10px] md:text-xs font-bold text-primary">View All</Link>
               </div>
               <div className="space-y-2 md:space-y-3">
                  {localProviders.slice(0, 3).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-4 group cursor-pointer">
                       <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl overflow-hidden relative border shadow-sm flex-shrink-0">
                          <Image src={item.image || "/images/logo.png"} alt={item.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                       </div>
                       <div className="flex-grow space-y-0.5">
                          <h5 className="text-[10px] md:text-xs font-bold group-hover:text-primary transition-colors truncate max-w-[120px]">{item.name}</h5>
                          <p className="text-[8px] md:text-[10px] text-muted-foreground">₹1,499</p>
                       </div>
                       <div className="flex items-center gap-1">
                          <Star className="h-2 w-2 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-[8px] md:text-[10px] font-bold text-slate-700">4.8</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Community Engagement Sidebar */}
            <Card className="bg-[#274E4A] text-white border-none rounded-[2rem] overflow-hidden p-5 md:p-6 relative group shadow-lg">
               <div className="relative z-10 space-y-3 md:space-y-4">
                  <h3 className="text-lg md:text-xl font-bold font-headline leading-tight">Join Our Community</h3>
                  <p className="text-[10px] md:text-xs opacity-80 leading-relaxed">Share stories, get tips, find parents!</p>
                  <Button variant="secondary" size="sm" className="rounded-xl font-bold flex items-center gap-2 h-8 text-[10px] md:text-xs">
                     <UsersIcon className="h-3 w-3 md:h-4 md:w-4" /> Join Now <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                  </Button>
               </div>
               <Image src="https://picsum.photos/seed/community/400/400" alt="Community" width={140} height={140} className="absolute -bottom-4 -right-8 object-cover opacity-60 group-hover:scale-110 transition-transform md:w-[180px] md:h-[180px]" />
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            Business Overview, {user?.displayName?.split(' ')[0]}! <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Manage your service schedule and grow your pet business.
          </p>
        </div>
        <Link href="/business-profile">
          <Button variant="outline" className="rounded-full bg-white shadow-sm border-none flex items-center gap-2 h-9 md:h-10 text-[10px] md:text-xs">
            <Briefcase className="h-3 w-3 md:h-4 md:w-4 text-primary" />
            <span>My Listing</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Bookings</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold">128</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-green-600 font-bold">
              <TrendingUp className="h-3 w-3" /> +12% this month
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer Rating</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold">4.9/5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-2 w-2 md:h-3 md:w-3 fill-yellow-400 text-yellow-400" />)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Match Efficiency</CardDescription>
            <CardTitle className="text-2xl md:text-3xl font-bold">92%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={92} className="h-1.5 md:h-2 bg-muted" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base md:text-lg">Recent Booking Requests</CardTitle>
                <CardDescription className="text-[10px] md:text-xs">New requests waiting for your approval.</CardDescription>
              </div>
              <Link href="/bookings">
                <Button variant="link" className="text-primary text-[10px] md:text-xs font-bold">View Schedule</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {newBookings.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                   {newBookings.map((req) => (
                     <div key={req.id} className="flex items-center justify-between p-3 md:p-4 bg-muted/20 rounded-xl border border-muted">
                        <div className="flex items-center gap-2 md:gap-3">
                           <Avatar className="h-8 w-8 md:h-10 md:w-10">
                              <AvatarFallback><User className="h-4 w-4 md:h-5 md:w-5" /></AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="font-bold text-[11px] md:text-sm">{req.serviceType}</p>
                              <p className="text-[9px] md:text-[10px] text-muted-foreground">{req.date} at {req.time}</p>
                           </div>
                        </div>
                        <Link href="/bookings">
                          <Button size="sm" className="h-7 md:h-8 text-[9px] md:text-xs">Manage</Button>
                        </Link>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-10 md:py-12 border-2 border-dashed rounded-xl">
                   <Calendar className="mx-auto h-10 w-10 md:h-12 md:w-12 text-muted/20 mb-2 md:mb-3" />
                   <p className="text-xs md:text-sm text-muted-foreground font-medium">No pending requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          <Card className="border-none shadow-sm bg-[#274E4A] text-white rounded-2xl overflow-hidden shadow-lg">
             <CardHeader>
                <CardTitle className="text-base md:text-lg">Grow Your Reach</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-[11px] md:text-sm opacity-90 leading-relaxed mb-4 md:mb-6">
                  Complete your profile and add high-quality service photos to attract more pet owners in your area.
                </p>
                <Link href="/business-profile">
                  <Button variant="secondary" className="w-full font-bold h-9 md:h-10 text-[10px] md:text-xs">Update My Listing</Button>
                </Link>
             </CardContent>
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
