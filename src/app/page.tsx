
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, onSnapshot, doc, getDocs, limit } from "firebase/firestore";
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
  Waves,
  Calendar
} from "lucide-react";

const SERVICE_GRID = [
  { title: 'Match Your Pet', desc: 'Find companions', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', href: '/match' },
  { title: 'Pet Walker', desc: 'Safe walkers', icon: UserIcon, color: 'text-green-600', bg: 'bg-green-50', href: '/providers?service=Walking' },
  { title: 'Pet Training', desc: 'Expert trainers', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', href: '/providers?service=Training' },
  { title: 'Pet Grooming', desc: 'Clean & happy', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-50', href: '/providers?service=Grooming' },
  { title: 'Pet Boarding', desc: 'Loving stays', icon: HomeIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/providers?service=Boarding' },
  { title: 'Pet Reports', desc: 'Health vault', icon: FileTextIcon, color: 'text-teal-600', bg: 'bg-teal-50', href: '/records' },
  { title: 'Pet Playzone', desc: 'Active fun', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-50', href: '/playzone' },
];

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  const router = useRouter();
  
  const [petData, setPetData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localProviders, setLocalProviders] = useState<any[]>([]);
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Hero Banner */}
          <section className="relative rounded-[2.5rem] overflow-hidden aspect-[2/1] sm:aspect-[2.5/1] shadow-lg group">
            <Image 
              src={placeholderImages.hero.dashboard.url} 
              alt="Hero Banner" 
              fill 
              className="object-cover"
              priority
              data-ai-hint={placeholderImages.hero.dashboard.hint}
            />
            <div className="absolute inset-0 bg-black/20 flex flex-col justify-center px-10 text-white">
              <h1 className="text-3xl sm:text-5xl font-bold font-headline max-w-lg leading-[1.1]">
                Your Pet's Happiness<br/>Our Top Priority
              </h1>
              <p className="mt-4 text-sm font-medium opacity-90 hidden sm:block max-w-md">
                All pet care services, products and community — in one place.
              </p>
              
              <form onSubmit={handleHeroSearch} className="mt-8 flex items-center bg-white rounded-full p-1 shadow-2xl w-full max-w-md">
                <div className="flex flex-1 items-center px-4">
                  <Search className="h-4 w-4 text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search for services..."
                    className="w-full text-slate-800 text-sm py-2 bg-transparent border-none focus:ring-0 placeholder:text-slate-400"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 font-bold h-10">
                  Search
                </Button>
              </form>
            </div>
          </section>

          {/* Service Grid Icons */}
          <section className="grid grid-cols-4 sm:grid-cols-7 gap-4">
            {SERVICE_GRID.map((item, i) => (
              <Link key={i} href={item.href} className="flex flex-col items-center group">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-lg mb-2 shadow-sm", item.bg, item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-[9px] font-black text-slate-800 text-center uppercase tracking-[0.1em]">{item.title}</span>
              </Link>
            ))}
          </section>

          {/* Promo Row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#466935] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md hover:shadow-lg transition-all h-[180px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-headline leading-tight">Healthy Pets<br/>Happier Lives</h3>
                  <p className="text-[10px] opacity-80 max-w-[140px]">Book grooming, training, and more.</p>
                </div>
                <Button variant="secondary" size="sm" className="rounded-full font-bold h-8 text-[10px] bg-white text-[#466935] hover:bg-white/90">
                  Explore <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 w-24 h-24 opacity-30 group-hover:scale-110 transition-transform">
                <Image src={placeholderImages.promos.promo1.url} alt="Promo 1" fill className="object-cover rounded-xl" data-ai-hint={placeholderImages.promos.promo1.hint} />
              </div>
            </Card>

            <Card className="bg-[#F8D2E2] text-[#802D52] border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md hover:shadow-lg transition-all h-[180px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-headline leading-tight">Because Every Pet<br/>Deserves Love</h3>
                </div>
                <Button size="sm" className="bg-[#802D52] text-white rounded-full font-bold h-8 text-[10px] hover:bg-[#802D52]/90">
                  Community <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 w-24 h-24 opacity-30 group-hover:scale-110 transition-transform">
                <Image src={placeholderImages.promos.promo2.url} alt="Promo 2" fill className="object-cover rounded-xl" data-ai-hint={placeholderImages.promos.promo2.hint} />
              </div>
            </Card>

            <Card className="bg-[#0D2B2B] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md hover:shadow-lg transition-all h-[180px]">
              <div className="relative z-10 h-full flex flex-col justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-headline">Pet Reports</h3>
                  <p className="text-[10px] opacity-80">Track health and habits.</p>
                </div>
                <Button variant="secondary" size="sm" className="rounded-full font-bold h-8 text-[10px] bg-white text-[#0D2B2B] hover:bg-white/90">
                  View Reports <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
              <div className="absolute bottom-4 right-4 w-24 h-24 opacity-30 group-hover:scale-110 transition-transform">
                <Image src={placeholderImages.promos.promo3.url} alt="Promo 3" fill className="object-cover rounded-xl" data-ai-hint={placeholderImages.promos.promo3.hint} />
              </div>
            </Card>
          </section>

          {/* Featured Services */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold font-headline text-slate-900">Featured Services</h2>
              <Link href="/providers" className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-[0.2em] hover:opacity-80 transition-opacity">
                View All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {localProviders.map((provider) => (
                <Link key={provider.id} href={`/providers/${provider.id}`}>
                  <Card className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-xl transition-all bg-white">
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image 
                        src={provider.image || "/images/logo.png"} 
                        alt={provider.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                    </div>
                    <CardContent className="p-4 bg-white">
                      <h4 className="font-bold text-xs truncate text-slate-900 mb-1">{provider.name}</h4>
                      <div className="flex items-center gap-1 text-slate-400">
                         <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                         <span className="text-[10px] font-bold text-slate-800">{provider.rating}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-8">
          {/* User Greeting and Pet Card */}
          <div className="space-y-6">
            <div className="px-2">
              <h2 className="text-2xl font-bold font-headline text-slate-900 leading-tight">Hello, {displayName.split(' ')[0]}!</h2>
              <p className="text-xs text-slate-400 font-medium">A better life for your pet, always.</p>
            </div>

            <Card className="border-none shadow-md rounded-[2rem] p-5 bg-white relative group overflow-hidden">
              <div className="flex items-center gap-4 relative z-10">
                <Avatar className="h-16 w-16 border-4 border-slate-50 shadow-sm ring-1 ring-slate-100">
                  <AvatarImage src={petData?.avatar || "/images/logo.png"} className="object-cover" />
                  <AvatarFallback className="bg-orange-50 text-primary font-bold">{petData?.name?.[0] || 'B'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-slate-800 truncate">{petData?.name || 'Buddy2'}</p>
                    <Badge variant="outline" className="text-[9px] bg-orange-50 border-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full shrink-0">Active</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{petData?.breed || 'Golden Retriever'} • {petData?.age || '3 years'}</p>
                </div>
              </div>
              <Settings className="absolute top-4 right-4 h-4 w-4 text-slate-200 cursor-pointer hover:text-primary transition-colors" />
            </Card>
          </div>

          {/* Recently Viewed */}
          <div className="space-y-5 px-2">
             <h3 className="font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400">Recently Viewed</h3>
             <div className="space-y-4">
               {placeholderImages.recentlyViewed.map((item, i) => (
                 <div key={i} className="flex items-center gap-4 group cursor-pointer hover:bg-white p-2 -mx-2 rounded-2xl transition-all hover:shadow-sm">
                    <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-sm">
                      <Image src={item.url} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform" data-ai-hint={item.hint} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 leading-none">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1.5">{item.price}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-[10px] font-bold text-slate-700">{item.rating}</span>
                    </div>
                 </div>
               ))}
             </div>
          </div>

          {/* Community Callout Banner */}
          <Card className="bg-[#0D2B2B] text-white border-none rounded-[2.5rem] overflow-hidden p-8 relative group shadow-2xl">
             <div className="relative z-10 space-y-5">
                <h3 className="text-xl font-bold leading-tight font-headline">Join Our PetMets Community</h3>
                <p className="text-[11px] opacity-70 max-w-[200px] leading-relaxed font-medium">Share stories and find pet parents near you!</p>
                <Button variant="outline" size="sm" className="rounded-full font-bold flex items-center gap-2 h-11 text-[11px] px-8 bg-white text-[#0D2B2B] hover:bg-white/90 border-none transition-all hover:scale-105">
                   Join Now <ArrowRight className="h-3 w-3" />
                </Button>
             </div>
             <div className="absolute top-0 right-0 w-40 h-full opacity-20 pointer-events-none bg-gradient-to-l from-white/20 to-transparent" />
             <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 group-hover:scale-110 transition-transform grayscale">
               <Image src={placeholderImages.sidebar.community.url} alt="Community" fill className="object-cover" data-ai-hint={placeholderImages.sidebar.community.hint} />
             </div>
          </Card>

          {/* Trust Bar Footer */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-5 p-2 pt-4">
             {[
               { label: 'Trusted Vendors', icon: ShieldCheck },
               { label: 'Secure Payments', icon: CreditCard },
               { label: '24/7 Support', icon: Headphones },
               { label: 'Happy Community', icon: UsersIcon },
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-2.5 group cursor-default">
                  <item.icon className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

