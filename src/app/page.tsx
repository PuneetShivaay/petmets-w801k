
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, onSnapshot, doc, getDocs, limit, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import Image from "next/image";
import placeholderImages from "@/app/lib/placeholder-images.json";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Activity,
  User as UserIcon,
  GraduationCap,
  Scissors,
  MapPin,
  Star,
  Heart,
  FileText as FileTextIcon,
  Search,
  Home as HomeIcon,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Headphones,
  Users as UsersIcon,
  Settings,
  Calendar,
  Clock,
  Ticket
} from "lucide-react";

const SERVICE_GRID = [
  { title: 'Match Your Pet', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', href: '/match' },
  { title: 'Pet Walker', icon: UserIcon, color: 'text-green-600', bg: 'bg-green-50', href: '/providers?service=Walking' },
  { title: 'Pet Training', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', href: '/providers?service=Training' },
  { title: 'Pet Grooming', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-50', href: '/providers?service=Grooming' },
  { title: 'Pet Boarding', icon: HomeIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/providers?service=Boarding' },
  { title: 'Pet Reports', icon: FileTextIcon, color: 'text-teal-600', bg: 'bg-teal-50', href: '/records' },
  { title: 'Pet Playzone', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-50', href: '/playzone' },
];

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  const router = useRouter();
  
  const [petData, setPetData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localProviders, setLocalProviders] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [heroSearch, setHeroSearch] = useState("");

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    if (userRole === 'owner') {
      const petRef = doc(db, "pets", user.uid);
      const unsubscribePet = onSnapshot(petRef, (docSnap) => {
        if (docSnap.exists()) {
          setPetData({ id: docSnap.id, ...docSnap.data() });
        }
      });

      const bookingsQuery = query(
        collection(db, "bookings"),
        where("ownerId", "==", user.uid),
        where("status", "in", ["pending", "accepted"]),
        limit(2)
      );

      const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        data.sort((a: any, b: any) => a.date.localeCompare(b.date));
        setUpcomingBookings(data);
        setLoading(false);
      });

      const fetchLocal = async () => {
        const q = query(collection(db, "service_providers"), limit(4));
        const snap = await getDocs(q);
        setLocalProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchLocal();

      return () => {
        unsubscribePet();
        unsubscribeUser();
        unsubscribeBookings();
      };
    } else {
      setLoading(false);
      return () => unsubscribeUser();
    }
  }, [user, userRole]);

  const handleHeroSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (heroSearch.trim()) {
      router.push(`/providers?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-[200px] w-full rounded-[2rem]" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const displayName = userData?.name || user?.displayName || 'Pet Parent';

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Hero Banner */}
          <section className="relative rounded-[3rem] overflow-hidden aspect-[2.2/1] shadow-lg group">
            <Image 
              src={placeholderImages.hero.dashboard.url} 
              alt="Hero Banner" 
              fill 
              className="object-cover"
              priority
              data-ai-hint={placeholderImages.hero.dashboard.hint}
            />
            <div className="absolute inset-0 bg-black/10 flex flex-col justify-center px-12 text-white">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Pet Premium Services</span>
                <h1 className="text-4xl sm:text-6xl font-black font-headline max-w-xl leading-[1]">
                  Your Pet's Happiness<br/>Our Top Priority
                </h1>
                <p className="mt-4 text-xs font-bold opacity-90 max-w-sm leading-relaxed">
                  All pet care services, products and community — in one place.
                </p>
              </div>

              <div className="absolute top-12 right-12 hidden lg:block">
                 <p className="text-right text-[11px] font-bold leading-tight opacity-90">
                    Because<br/>they're...
                 </p>
              </div>
              
              <form onSubmit={handleHeroSearch} className="mt-8 flex items-center bg-white rounded-full p-1.5 shadow-2xl w-full max-w-md">
                <div className="flex flex-1 items-center px-4">
                  <Search className="h-4 w-4 text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search for services..."
                    className="w-full text-slate-800 text-sm py-2 bg-transparent border-none focus:ring-0 placeholder:text-slate-400 font-medium"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 font-black h-11 text-xs uppercase tracking-wider transition-transform hover:scale-105">
                  Search
                </Button>
              </form>
            </div>
          </section>

          {/* Service Grid Icons */}
          <section className="flex flex-wrap items-center justify-between gap-6 px-2">
            {SERVICE_GRID.map((item, i) => (
              <Link key={i} href={item.href} className="flex flex-col items-center group flex-1 min-w-[80px]">
                <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg mb-3 shadow-sm", item.bg, item.color)}>
                  <item.icon className="h-7 w-7" />
                </div>
                <span className="text-[9px] font-black text-slate-900 text-center uppercase tracking-[0.2em]">{item.title}</span>
              </Link>
            ))}
          </section>

          {/* Promo Row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#466935] text-white border-none rounded-[2.5rem] overflow-hidden p-8 relative group cursor-pointer shadow-md hover:shadow-xl transition-all h-[190px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-black font-headline leading-[1.1]">Healthy Pets<br/>Happier Lives</h3>
                  <p className="text-[10px] opacity-70 max-w-[140px] font-medium leading-relaxed">Book grooming, training, and more.</p>
                </div>
                <Button variant="secondary" size="sm" className="rounded-full font-black h-9 text-[9px] uppercase tracking-widest bg-white text-[#466935] hover:bg-white/90 px-5">
                  Explore <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 w-28 h-28 opacity-40 group-hover:scale-110 transition-transform duration-500">
                <Image src={placeholderImages.promos.promo1.url} alt="Promo 1" fill className="object-cover rounded-2xl" data-ai-hint={placeholderImages.promos.promo1.hint} />
              </div>
            </Card>

            <Card className="bg-[#F8D2E2] text-[#802D52] border-none rounded-[2.5rem] overflow-hidden p-8 relative group cursor-pointer shadow-md hover:shadow-xl transition-all h-[190px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-black font-headline leading-[1.1]">Because Every Pet<br/>Deserves Love</h3>
                </div>
                <Button size="sm" className="bg-[#802D52] text-white rounded-full font-black h-9 text-[9px] uppercase tracking-widest hover:bg-[#802D52]/90 px-5">
                  Community <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 w-28 h-28 opacity-40 group-hover:scale-110 transition-transform duration-500">
                <Image src={placeholderImages.promos.promo2.url} alt="Promo 2" fill className="object-cover rounded-2xl" data-ai-hint={placeholderImages.promos.promo2.hint} />
              </div>
            </Card>

            <Card className="bg-[#0D2B2B] text-white border-none rounded-[2.5rem] overflow-hidden p-8 relative group cursor-pointer shadow-md hover:shadow-xl transition-all h-[190px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-black font-headline leading-[1.1]">Pet Reports</h3>
                  <p className="text-[10px] opacity-70 font-medium">Track health and habits.</p>
                </div>
                <Button variant="secondary" size="sm" className="rounded-full font-black h-9 text-[9px] uppercase tracking-widest bg-white text-[#0D2B2B] hover:bg-white/90 px-5">
                  View Reports <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 w-28 h-28 opacity-40 group-hover:scale-110 transition-transform duration-500">
                <Image src={placeholderImages.promos.promo3.url} alt="Promo 3" fill className="object-cover rounded-2xl" data-ai-hint={placeholderImages.promos.promo3.hint} />
              </div>
            </Card>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-10">
          {/* User Greeting and Pet Card */}
          <div className="space-y-8">
            <div className="px-2">
              <h2 className="text-3xl font-black font-headline text-slate-900 leading-[1.1]">Hello, {displayName.split(' ')[0]}!</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">A better life for your pet, always.</p>
            </div>

            <Card className="border-none shadow-xl rounded-[2.5rem] p-6 bg-white relative group overflow-hidden">
              <div className="flex items-center gap-5 relative z-10">
                <div className="relative">
                  <Avatar className="h-16 w-16 border-4 border-slate-50 shadow-md ring-1 ring-slate-100">
                    <AvatarImage src={petData?.avatar || "/images/logo.png"} className="object-cover" />
                    <AvatarFallback className="bg-orange-50 text-primary font-bold">{petData?.name?.[0] || 'B'}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <div className="h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-black text-slate-800 truncate">{petData?.name || 'Buddy'}</p>
                    <Badge variant="outline" className="text-[8px] bg-orange-50 border-orange-100 text-orange-600 font-black px-2 py-0.5 rounded-full shrink-0 uppercase tracking-tighter">Active</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">{petData?.breed || 'Golden Retriever'} • {petData?.age || '3 years'}</p>
                </div>
              </div>
              <Settings className="absolute top-6 right-6 h-4 w-4 text-slate-200 cursor-pointer hover:text-primary transition-colors" />
            </Card>
          </div>

          {/* Upcoming Sessions Ticket */}
          <div className="space-y-5 px-2">
             <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400">Upcoming Sessions</h3>
             <div className="space-y-4">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <Link key={booking.id} href="/bookings">
                      <Card className="relative overflow-hidden rounded-[2rem] border-none shadow-lg bg-white p-5 group hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-primary/10">
                          <div className="flex items-center gap-4 relative z-10">
                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                              <Calendar className="h-6 w-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-900 leading-none truncate">{booking.serviceType}</p>
                              <div className="flex items-center gap-3 mt-2">
                                <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {booking.date}
                                </p>
                                <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {booking.time}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="absolute top-0 right-0 p-4 opacity-[0.02]">
                            <Ticket className="h-16 w-16 -rotate-12" />
                          </div>
                      </Card>
                    </Link>
                  ))
                ) : (
                  <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Sessions Booked</p>
                  </div>
                )}
             </div>
          </div>

          {/* Recently Viewed */}
          <div className="space-y-6 px-2">
             <h3 className="font-black text-[10px] uppercase tracking-[0.25em] text-slate-400">Recently Viewed</h3>
             <div className="space-y-5">
               {placeholderImages.recentlyViewed.map((item, i) => (
                 <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-white p-2 -mx-2 rounded-[1.5rem] transition-all hover:shadow-md">
                    <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-sm border border-slate-50">
                      <Image src={item.url} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" data-ai-hint={item.hint} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 leading-tight">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1.5">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-black text-slate-700">{item.rating}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Trust Bar Footer */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6 p-4 pt-8 border-t border-slate-100">
             {[
               { label: 'Trusted Vendors', icon: ShieldCheck },
               { label: 'Secure Payments', icon: CreditCard },
               { label: '24/7 Support', icon: Headphones },
               { label: 'Happy Community', icon: UsersIcon },
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-3 group cursor-default">
                  <item.icon className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
