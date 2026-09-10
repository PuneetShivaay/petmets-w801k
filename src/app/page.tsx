
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, doc, getDocs, limit, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import Image from "next/image";
import placeholderImages from "@/app/lib/placeholder-images.json";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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
  User as UserIcon,
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
  Users as UsersIcon,
  Home as HomeIcon,
  ClipboardList
} from "lucide-react";

const HERO_SLIDES = [
  {
    image: placeholderImages.hero.dashboard.url,
    title: "Your Pet's Happiness Our Priority",
    description: "All pet care services, products and community - in one place.",
    hint: placeholderImages.hero.dashboard.hint
  }
];

const SERVICE_GRID = [
  { title: 'Match Your Pet', desc: 'Find the perfect companion', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', href: '/match' },
  { title: 'Pet Walker', desc: 'Safe & trusted walkers', icon: UserIcon, color: 'text-green-600', bg: 'bg-green-50', href: '/providers?service=Walking' },
  { title: 'Pet Training', desc: 'Better behavior, stronger bond', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', href: '/providers?service=Training' },
  { title: 'Pet Grooming', desc: 'Clean, fresh & happy pets', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-50', href: '/providers?service=Grooming' },
  { title: 'Pet Boarding', desc: 'Safe stays, loving care', icon: HomeIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/providers?service=Boarding' },
  { title: 'Pet Reports', desc: 'Health, activity & more', icon: FileTextIcon, color: 'text-teal-600', bg: 'bg-teal-50', href: '/records' },
  { title: 'Pet Playzone', desc: 'Play, socialize, make friends', icon: Activity, color: 'text-red-400', bg: 'bg-red-50', href: '/match' },
];

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  const router = useRouter();
  
  // Data State
  const [petData, setPetData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localProviders, setLocalProviders] = useState<any[]>([]);
  const [heroSearch, setHeroSearch] = useState("");

  useEffect(() => {
    if (!user) return;

    // Fetch User Data from Firestore for the most up-to-date name/avatar
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
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  const displayName = userData?.name || user?.displayName || 'Pet Parent';
  const userAvatar = userData?.avatar || user?.photoURL || "https://picsum.photos/seed/user/100/100";

  if (userRole === 'owner') {
    return (
      <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 sm:p-6 lg:p-10 max-w-[1600px] mx-auto w-full">
          
          {/* Main Dashboard Feed */}
          <div className="lg:col-span-8 space-y-8 md:space-y-10">
            
            {/* Hero Section */}
            <section className="relative rounded-[2rem] md:rounded-[2.5rem] overflow-hidden aspect-[1.3/1] sm:aspect-[2.4/1] shadow-lg group">
              <Image 
                src={HERO_SLIDES[0].image} 
                alt="Pet Happiness" 
                fill 
                className="object-cover"
                data-ai-hint={HERO_SLIDES[0].hint}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent flex flex-col justify-center px-6 sm:px-12 text-white">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline max-w-xs sm:max-w-md leading-tight">
                  {HERO_SLIDES[0].title}
                </h1>
                <p className="mt-2 sm:mt-4 text-xs sm:text-sm opacity-90 max-w-[200px] sm:max-w-sm">
                  {HERO_SLIDES[0].description}
                </p>
                
                <form onSubmit={handleHeroSearch} className="mt-6 sm:mt-8 flex items-center bg-white rounded-full p-1.5 shadow-xl w-full max-w-sm sm:max-w-xl">
                  <div className="flex flex-1 items-center px-2 sm:px-4">
                    <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 mr-2" />
                    <input 
                      type="text" 
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                      placeholder="Search for services..."
                      className="w-full text-slate-800 text-[10px] sm:text-sm py-2 bg-transparent border-none focus:ring-0"
                    />
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-6 sm:px-8 font-bold h-8 sm:h-10 text-[10px] sm:text-sm text-white">
                    Search
                  </Button>
                </form>
              </div>
            </section>

            {/* Service Grid */}
            <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {SERVICE_GRID.map((item, i) => (
                <Link key={i} href={item.href} className="group flex flex-col items-center">
                  <div className={cn("h-14 w-14 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md mb-2 sm:mb-3", item.bg, item.color)}>
                    <item.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <h4 className="text-[10px] font-bold text-slate-800 text-center uppercase tracking-wider">{item.title}</h4>
                  <p className="text-[9px] text-slate-400 text-center mt-1 leading-tight hidden sm:block">{item.desc}</p>
                </Link>
              ))}
            </section>

            {/* Promo Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#466935] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-4">
                  <h3 className="text-base font-bold font-headline leading-tight text-white">Healthy Pets<br/>Happier Lives</h3>
                  <p className="text-[10px] opacity-80 max-w-[150px]">Book grooming, training, boarding and more — all in one place.</p>
                  <Button variant="secondary" size="sm" className="rounded-full font-bold h-8 text-[10px] bg-white text-[#466935]">Explore Services <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-60 group-hover:scale-110 transition-transform">
                  <Image src={placeholderImages.promos.promo1.url} alt="Dog" fill className="object-contain object-right-bottom" data-ai-hint={placeholderImages.promos.promo1.hint} />
                </div>
              </Card>

              <Card className="bg-[#F8D2E2] text-[#802D52] border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-4">
                   <h3 className="text-base font-bold font-headline leading-tight">Because<br/>Every Pet Deserves Love</h3>
                  <Button size="sm" className="bg-[#802D52] text-white rounded-full font-bold h-8 text-[10px]">Explore Pet Store <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-60 group-hover:scale-110 transition-transform">
                  <Image src={placeholderImages.promos.promo2.url} alt="Pets" fill className="object-contain object-right-bottom" data-ai-hint={placeholderImages.promos.promo2.hint} />
                </div>
              </Card>

              <Card className="bg-[#0D2B2B] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <PawPrintIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-base font-bold font-headline text-white">Pet Reports</h3>
                  </div>
                  <p className="text-[10px] opacity-80">Track health, activity, habits & more.</p>
                  <Button variant="secondary" size="sm" className="rounded-full font-bold h-8 text-[10px] bg-white text-[#0D2B2B]">View Reports <ArrowRight className="ml-2 h-3 w-3" /></Button>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 opacity-60 group-hover:scale-110 transition-transform">
                  <Image src={placeholderImages.promos.promo3.url} alt="Reports" fill className="object-contain object-right-bottom" data-ai-hint={placeholderImages.promos.promo3.hint} />
                </div>
              </Card>
            </section>

            {/* Featured Services */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold font-headline flex items-center gap-2 text-slate-900">
                   Featured Services
                </h2>
                <Link href="/providers" className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-widest">
                  View All Services <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {localProviders.map((provider) => (
                  <Link key={provider.id} href={`/providers/${provider.id}`}>
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden group hover:shadow-md transition-all bg-white p-2">
                      <div className="relative aspect-square rounded-xl overflow-hidden">
                        <Image src={provider.image || "/images/logo.png"} alt={provider.name} fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <CardContent className="p-2 pt-3">
                        <h4 className="font-bold text-[10px] truncate text-slate-800">{provider.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-0.5">
                             <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                             <span className="text-[9px] font-bold">{provider.rating}</span>
                          </div>
                          <ChevronRight className="h-3 w-3 text-slate-300" />
                        </div>
                        <p className="text-[10px] font-bold text-primary mt-1">From ₹{provider.price || '499'}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
            
            {/* Trust Footer */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
               {[
                 { label: 'Trusted Vendors', sub: 'Verified & checked', icon: ShieldCheck },
                 { label: 'Secure Payments', sub: 'Multiple options', icon: CreditCard },
                 { label: '24/7 Support', sub: "We're here", icon: Headphones },
                 { label: 'Happy Pets', sub: 'Thousands served', icon: UsersIcon },
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                       <item.icon className="h-4 w-4" />
                    </div>
                    <div>
                       <p className="text-[10px] font-bold text-slate-800">{item.label}</p>
                       <p className="text-[8px] text-slate-400">{item.sub}</p>
                    </div>
                 </div>
               ))}
            </section>
          </div>

          {/* Right Sidebar - Desktop Only */}
          <div className="lg:col-span-4 space-y-8 hidden lg:block">
            
            {/* User Greeting & Pet Card */}
            <Card className="border-none shadow-sm rounded-[2rem] p-6 bg-white space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 shadow-md">
                    <AvatarImage src={userAvatar} className="object-cover" />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-bold font-headline text-slate-900 leading-tight">Hello, {displayName.split(' ')[0]}!</h2>
                    <p className="text-[10px] text-slate-400">A better life for your pet, always.</p>
                  </div>
                </div>
                <Settings className="h-4 w-4 text-slate-300 cursor-pointer" />
              </div>

              {/* Single Pet Display */}
              <div className="p-4 rounded-[1.5rem] border border-orange-100 bg-orange-50/30">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-4 ring-white shadow-sm">
                      <AvatarImage src={petData?.avatar || "/images/logo.png"} className="object-cover" />
                      <AvatarFallback>B</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold text-slate-800 truncate">{petData?.name || 'Buddy'}</p>
                        <Badge variant="outline" className="text-[8px] bg-white border-orange-100 text-orange-600 font-bold px-1.5 py-0 h-4">Main Pet</Badge>
                      </div>
                      <p className="text-[9px] text-slate-500 mt-0.5">{petData?.breed || 'Golden Retriever'} • {petData?.age || '3 years'}</p>
                    </div>
                 </div>
              </div>
            </Card>

            {/* Upcoming Sessions Ticket */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Upcoming Sessions</h3>
                <Link href="/bookings" className="text-[10px] font-bold text-primary">History</Link>
              </div>
              <Card className="rounded-[1.5rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-shadow">
                 <div className="flex items-stretch">
                    <div className="w-2 bg-primary group-hover:bg-primary/80 transition-colors" />
                    <div className="flex-1 p-4 flex items-center gap-4">
                       <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl px-3 py-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Oct</span>
                          <span className="text-lg font-bold text-slate-800 leading-none mt-1">12</span>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-slate-800 truncate">Pet Walker Session</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">With Riya Sharma • 5:00 PM</p>
                       </div>
                       <ChevronRight className="h-4 w-4 text-slate-200" />
                    </div>
                 </div>
              </Card>
            </div>

            {/* Recently Viewed */}
            <div className="space-y-4">
               <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400">Recently Viewed</h3>
              </div>
              <div className="space-y-3 px-1">
                 {placeholderImages.recentlyViewed.map((item, i) => (
                   <div key={i} className="flex items-center gap-3 group cursor-pointer">
                      <Avatar className="h-10 w-10 rounded-xl">
                        <AvatarImage src={item.url} className="object-cover" data-ai-hint={item.hint} />
                        <AvatarFallback>P</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-slate-800 group-hover:text-primary transition-colors">{item.title}</p>
                        <p className="text-[9px] text-slate-400">{item.price}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                        <span className="text-[9px] font-bold text-slate-700">{item.rating}</span>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            {/* Community & Promotion */}
            <Card className="bg-[#0D2B2B] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group shadow-lg">
               <div className="relative z-10 space-y-4">
                  <h3 className="text-base font-bold leading-tight font-headline text-white">Join Our PetMets Community</h3>
                  <p className="text-[9px] opacity-70 leading-relaxed max-w-[180px]">Share stories, get expert tips, and find pet parents near you!</p>
                  <Button variant="outline" size="sm" className="rounded-full font-bold flex items-center gap-2 h-9 text-[10px] px-6 bg-white text-[#0D2B2B] hover:bg-white/90 border-none">
                     <UsersIcon className="h-3 w-3" /> Join Now <ArrowRight className="h-3 w-3" />
                  </Button>
               </div>
               <div className="absolute bottom-0 right-0 w-32 h-32 opacity-30 group-hover:scale-105 transition-transform">
                 <Image src={placeholderImages.sidebar.community.url} alt="Pets" fill className="object-contain object-right-bottom" data-ai-hint={placeholderImages.sidebar.community.hint} />
               </div>
            </Card>

          </div>
        </div>
      </div>
    );
  }

  // Provider Dashboard
  return (
    <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold font-headline">Provider Dashboard</h1>
        <p className="text-muted-foreground">Manage your pet services and track your performance.</p>
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
