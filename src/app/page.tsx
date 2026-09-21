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
  Ticket,
  ChevronRight,
  ChevronDown
} from "lucide-react";

const SERVICE_GRID = [
  { title: 'Match Your Pet', icon: Heart, color: 'text-[#E63946]', bg: 'bg-[#FFEBEE]', href: '/match', desc: 'Find the perfect companion' },
  { title: 'Pet Walker', icon: UserIcon, color: 'text-[#2A9D8F]', bg: 'bg-[#E0F2F1]', href: '/providers?service=Walking', desc: 'Safe & trusted walkers' },
  { title: 'Pet Training', icon: GraduationCap, color: 'text-[#457B9D]', bg: 'bg-[#E1F5FE]', href: '/providers?service=Training', desc: 'Better behavior, stronger bond' },
  { title: 'Pet Grooming', icon: Scissors, color: 'text-[#F4A261]', bg: 'bg-[#FFF3E0]', href: '/providers?service=Grooming', desc: 'Clean, fresh & happy pets' },
  { title: 'Pet Boarding', icon: HomeIcon, color: 'text-[#1D3557]', bg: 'bg-[#E8EAF6]', href: '/providers?service=Boarding', desc: 'Safe stays, loving care' },
  { title: 'Pet Reports', icon: FileTextIcon, color: 'text-[#264653]', bg: 'bg-[#F1F8E9]', href: '/records', desc: 'Health, activity & more' },
  { title: 'Pet Playzone', icon: Activity, color: 'text-[#E76F51]', bg: 'bg-[#FBE9E7]', href: '/playzone', desc: 'Play, socialize, make friends' },
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
        limit(1)
      );

      const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setUpcomingBookings(data);
        setLoading(false);
      });

      const fetchLocal = async () => {
        const q = query(collection(db, "service_providers"), limit(6));
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
      <div className="space-y-6 p-4 md:p-6">
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const displayName = userData?.name || user?.displayName || 'Ghanist';
  const userAvatar = userData?.avatar || user?.photoURL || "https://picsum.photos/seed/userhead/100/100";

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F7]">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        
        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Hero Banner */}
          <section className="relative rounded-xl overflow-hidden aspect-[2.8/1] shadow-sm group border border-white">
            <Image 
              src={placeholderImages.hero.dashboard.url} 
              alt="Hero Banner" 
              fill 
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent flex flex-col justify-center px-6 md:px-12">
               <div className="max-w-md hidden md:block">
                  <h1 className="text-white text-3xl md:text-4xl font-black font-headline leading-tight drop-shadow-lg">
                    Pet Premium Services
                  </h1>
                  <p className="text-white/80 text-[10px] font-bold mt-2 tracking-wide uppercase">
                    Because they're more than just pets, they're family.
                  </p>
               </div>
              <form onSubmit={handleHeroSearch} className="mt-2 md:mt-8 flex items-center bg-white rounded-full p-0.5 md:p-1 shadow-lg w-full max-w-lg">
                <div className="flex flex-1 items-center px-2 md:px-4">
                  <Search className="h-3 w-3 md:h-4 md:w-4 text-slate-400 mr-1 md:mr-2" />
                  <input 
                    type="text" 
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search for services..."
                    className="w-full text-[10px] md:text-xs py-1 md:py-2.5 bg-transparent border-none focus:ring-0 placeholder:text-slate-400"
                  />
                </div>
                <Button type="submit" className="bg-[#FF642F] hover:bg-[#FF642F]/90 text-white rounded-full px-3 md:px-8 font-bold h-7 md:h-10 text-[8px] md:text-[10px] uppercase tracking-wider">
                  Search
                </Button>
              </form>
            </div>
          </section>

          {/* Service Grid Icons */}
          <section className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
            {SERVICE_GRID.map((item, i) => (
              <Link key={i} href={item.href} className="flex flex-col items-center group text-center">
                <div className={cn("h-12 w-12 md:h-14 md:w-14 rounded-full flex items-center justify-center transition-all group-hover:shadow-md mb-2 md:mb-3 shadow-sm", item.bg, item.color)}>
                  <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">{item.title}</span>
                <p className="text-[10px] text-slate-500 mt-1 leading-tight">{item.desc}</p>
              </Link>
            ))}
          </section>

          {/* Promo Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#466935] text-white border-none rounded-xl overflow-hidden p-5 relative group cursor-pointer shadow-sm h-[160px] md:h-[180px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base md:text-lg font-bold font-headline leading-[1.1]">Healthy Pets<br/>Happier Lives</h3>
                  <p className="text-[8px] md:text-[9px] opacity-80 max-w-[130px] leading-relaxed">Book grooming, training, boarding and more.</p>
                </div>
                <Link href="/providers">
                  <Button variant="secondary" size="sm" className="rounded-full font-bold h-7 md:h-8 text-[8px] md:text-[9px] bg-white text-[#466935] hover:bg-white/90 px-3 md:px-4">
                    Explore Services <ArrowRight className="ml-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  </Button>
                </Link>
              </div>
              <div className="absolute bottom-2 right-2 w-24 h-24 md:w-28 md:h-28 group-hover:scale-105 transition-transform duration-500">
                <Image src={placeholderImages.promos.promo1.url} alt="Promo 1" fill className="object-cover rounded-lg" />
              </div>
            </Card>

            <Card className="bg-[#F8D2E2] text-[#802D52] border-none rounded-xl overflow-hidden p-5 relative group cursor-pointer shadow-sm h-[160px] md:h-[180px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[7px] md:text-[8px] font-bold uppercase tracking-wider opacity-60">Pet Store</p>
                  <h3 className="text-base md:text-lg font-bold font-headline leading-[1.1]">Every Pet<br/>Deserves<br/>Love</h3>
                </div>
                <Link href="/providers">
                  <Button size="sm" className="bg-[#802D52] text-white rounded-full font-bold h-7 md:h-8 text-[8px] md:text-[9px] hover:bg-[#802D52]/90 px-3 md:px-4">
                    Explore Store <ArrowRight className="ml-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  </Button>
                </Link>
              </div>
              <div className="absolute bottom-2 right-2 w-24 h-24 md:w-28 md:h-28 group-hover:scale-105 transition-transform duration-500">
                <Image src={placeholderImages.promos.promo2.url} alt="Promo 2" fill className="object-cover rounded-lg" />
              </div>
            </Card>

            <Card className="bg-[#0D2B2B] text-white border-none rounded-xl overflow-hidden p-5 relative group cursor-pointer shadow-sm h-[160px] md:h-[180px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <FileTextIcon className="h-3 w-3 md:h-4 md:w-4" />
                    <h3 className="text-base md:text-lg font-bold font-headline leading-[1.1]">Pet Reports</h3>
                  </div>
                  <p className="text-[8px] md:text-[9px] opacity-80 max-w-[130px] leading-relaxed">Track health, activity, habits & more.</p>
                </div>
                <Link href="/records">
                  <Button variant="secondary" size="sm" className="rounded-full font-bold h-7 md:h-8 text-[8px] md:text-[9px] bg-white text-[#0D2B2B] hover:bg-white/90 px-3 md:px-4">
                    View Reports <ArrowRight className="ml-1 h-2.5 w-2.5 md:h-3 md:w-3" />
                  </Button>
                </Link>
              </div>
              <div className="absolute bottom-2 right-2 w-24 h-24 md:w-28 md:h-28 group-hover:scale-105 transition-transform duration-500">
                <Image src={placeholderImages.promos.promo3.url} alt="Promo 3" fill className="object-cover rounded-lg" />
              </div>
            </Card>
          </section>

          {/* Featured Services */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm md:text-md font-bold text-slate-900 flex items-center gap-2">
                 <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
                 Featured Services
              </h2>
              <Link href="/providers" className="text-[9px] md:text-[10px] font-bold text-[#274E4A] hover:underline flex items-center gap-1">
                View All <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {localProviders.map((provider) => (
                <Link key={provider.id} href={`/providers/${provider.id}`}>
                  <Card className="border-none shadow-sm rounded-xl overflow-hidden group hover:shadow-md transition-all bg-white">
                    <div className="relative aspect-square">
                      <Image 
                        src={provider.image || `https://picsum.photos/seed/${provider.id}/300/300`} 
                        alt={provider.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <CardContent className="p-2 md:p-3 space-y-1">
                      <p className="text-[9px] md:text-[10px] font-bold text-slate-800 truncate leading-none">{provider.name}</p>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                        <span className="text-[8px] md:text-[9px] font-bold text-slate-600">{provider.rating || '4.8'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* User & Pets Section */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-white space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-slate-50 shadow-sm">
                  <AvatarImage src={userAvatar} className="object-cover" />
                  <AvatarFallback className="bg-[#E0F2F1] text-[#2A9D8F] font-bold">{displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Hello, {displayName.split(' ')[0]}!</h2>
                  <p className="text-[8px] md:text-[9px] text-slate-400 font-medium">A better life for your pet.</p>
                </div>
              </div>
              <Settings className="h-3.5 w-3.5 text-slate-300 hover:text-slate-500 cursor-pointer" onClick={() => router.push('/pet-profile')} />
            </div>

            <div className="space-y-3">
               <Link href="/pet-profile" className="flex items-center gap-3 p-2 bg-[#F8FAFC] rounded-xl border border-slate-50 group cursor-pointer hover:bg-white transition-all">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                    <AvatarImage src={petData?.avatar || "https://picsum.photos/seed/buddy/100/100"} />
                    <AvatarFallback className="bg-orange-50 text-primary font-bold">{petData?.name?.[0] || 'B'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-800 truncate leading-none">{petData?.name || 'Buddy'}</p>
                    <p className="text-[7px] text-slate-400 mt-1 uppercase tracking-tighter">
                      {petData?.breed || 'Golden Retriever'} • {petData?.age || '2y'}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-slate-300" />
               </Link>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="space-y-4 px-1">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-[8px] uppercase tracking-wider text-slate-400">Upcoming Bookings</h3>
                <Link href="/bookings" className="text-[8px] font-bold text-[#274E4A] hover:underline">View All</Link>
             </div>
             
             {upcomingBookings.length > 0 ? (
               upcomingBookings.map((booking) => (
                 <Link key={booking.id} href="/bookings">
                    <Card className="rounded-xl border-none shadow-sm bg-white p-3 group hover:shadow-md transition-all relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg overflow-hidden shadow-sm shrink-0">
                           <Image 
                             src={booking.providerImageUrl || `https://picsum.photos/seed/${booking.id}/100/100`} 
                             alt="Provider" 
                             width={36} height={36} className="object-cover" 
                           />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-slate-800 truncate leading-none">{booking.serviceType || 'Pet Walker'}</p>
                          <p className="text-[7px] text-slate-400 font-medium mt-1">Today • {booking.time || '5:00 PM'}</p>
                        </div>
                        <Badge className="bg-[#E0F2F1] text-[#2A9D8F] border-none text-[7px] font-bold uppercase px-1.5 py-0.5 rounded-full shrink-0">Confirmed</Badge>
                      </div>
                    </Card>
                 </Link>
               ))
             ) : (
               <div className="py-6 text-center bg-white rounded-xl border border-dashed border-slate-100">
                  <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">No Bookings</p>
               </div>
             )}
          </div>

          {/* New to PetMets */}
          <Card className="bg-[#FFF3E0] border-none rounded-xl overflow-hidden relative group shadow-sm p-5">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#F4A261] flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  New to PetMets?
                </h3>
                <p className="text-xs text-slate-700 font-medium leading-snug">
                  Get <span className="font-bold text-primary">50% off</span> on your first<br/>service booking!
                </p>
                <Button className="bg-[#FF642F] hover:bg-[#FF642F]/90 text-white rounded-full px-6 font-bold h-8 text-[10px] uppercase tracking-wider mt-2">
                  Explore Now
                </Button>
              </div>
              <div className="w-24 h-24 absolute -bottom-5 -right-5 opacity-50">
                <Image src={placeholderImages.hero.dashboard.url} alt="New to PetMets" fill className="object-cover" />
              </div>
            </div>
          </Card>
          
          {/* Recently Viewed */}
          <div className="space-y-4 px-1">
             <div className="flex items-center justify-between">
                <h3 className="font-bold text-[8px] uppercase tracking-wider text-slate-400">Recently Viewed</h3>
                <Link href="/providers" className="text-[8px] font-bold text-[#274E4A] hover:underline">View All</Link>
             </div>
             <div className="space-y-3">
              <Card className="rounded-xl border-none shadow-sm bg-white p-3 group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden shadow-sm shrink-0">
                     <Image
                       src={`https://picsum.photos/seed/grooming/100/100`}
                       alt="Dog Grooming"
                       width={48} height={48} className="object-cover"
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-800 truncate">Dog Grooming</p>
                    <p className="text-[8px] text-slate-500 font-medium mt-1">₹1,499</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[9px] font-bold text-slate-600">4.8</span>
                  </div>
                </div>
              </Card>
              <Card className="rounded-xl border-none shadow-sm bg-white p-3 group hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden shadow-sm shrink-0">
                     <Image
                       src={`https://picsum.photos/seed/boarding/100/100`}
                       alt="Pet Boarding"
                       width={48} height={48} className="object-cover"
                     />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-slate-800 truncate">Pet Boarding</p>
                    <p className="text-[8px] text-slate-500 font-medium mt-1">₹699/day</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[9px] font-bold text-slate-600">4.9</span>
                  </div>
                </div>
              </Card>
             </div>
          </div>

          {/* Join Community Card */}
          <Card className="bg-[#274E4A] text-white border-none rounded-xl overflow-hidden relative group shadow-sm">
             <div className="p-5 relative z-10 space-y-3">
                <h4 className="text-[10px] md:text-[11px] font-bold leading-tight">Join Our PetMets Community</h4>
                <p className="text-[8px] md:text-[9px] opacity-70 font-medium leading-relaxed max-w-[150px]">
                  Share stories and get expert tips!
                </p>
                <Link href="/match">
                  <Button variant="secondary" className="rounded-full bg-white text-[#274E4A] hover:bg-white/90 font-bold px-4 h-6 text-[8px] uppercase tracking-wider">
                    Join Now <ArrowRight className="ml-1 h-2.5 w-2.5" />
                  </Button>
                </Link>
             </div>
             <div className="absolute -bottom-2 -right-2 w-20 h-20 opacity-30 group-hover:scale-110 transition-transform">
                <Image src={placeholderImages.sidebar.community.url} alt="Community" fill className="object-cover" />
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
