
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
  ChevronRight
} from "lucide-react";

const SERVICE_GRID = [
  { title: 'Match Your Pet', desc: 'Find companions', icon: Heart, color: 'text-red-500', bg: 'bg-red-50', href: '/match' },
  { title: 'Pet Walker', desc: 'Safe walkers', icon: UserIcon, color: 'text-green-600', bg: 'bg-green-50', href: '/providers?service=Walking' },
  { title: 'Pet Training', desc: 'Expert trainers', icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50', href: '/providers?service=Training' },
  { title: 'Pet Grooming', desc: 'Clean & happy', icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-50', href: '/providers?service=Grooming' },
  { title: 'Pet Boarding', desc: 'Loving stays', icon: HomeIcon, color: 'text-blue-600', bg: 'bg-blue-50', href: '/providers?service=Boarding' },
  { title: 'Pet Reports', desc: 'Health vault', icon: FileTextIcon, color: 'text-teal-600', bg: 'bg-teal-50', href: '/records' },
  { title: 'Pet Playzone', desc: 'Active fun', icon: Activity, color: 'text-rose-400', bg: 'bg-rose-50', href: '/match' },
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
        <Skeleton className="h-[200px] w-full rounded-[2rem]" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const displayName = userData?.name || user?.displayName || 'Pet Parent';
  const userAvatar = userData?.avatar || user?.photoURL || "https://picsum.photos/seed/user/100/100";

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Hero Banner */}
          <section className="relative rounded-[2rem] overflow-hidden aspect-[2/1] sm:aspect-[2.5/1] shadow-md group">
            <Image 
              src={placeholderImages.hero.dashboard.url} 
              alt="Hero Banner" 
              fill 
              className="object-cover"
              data-ai-hint={placeholderImages.hero.dashboard.hint}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-8 text-white">
              <h1 className="text-2xl sm:text-4xl font-bold font-headline max-w-md leading-tight">
                Your Pet's Happiness<br/>Our Top Priority
              </h1>
              <p className="mt-2 text-sm opacity-90 hidden sm:block">
                All pet care services, products and community — in one place.
              </p>
              
              <form onSubmit={handleHeroSearch} className="mt-6 flex items-center bg-white rounded-full p-1 shadow-lg w-full max-w-md">
                <div className="flex flex-1 items-center px-4">
                  <Search className="h-4 w-4 text-slate-400 mr-2" />
                  <input 
                    type="text" 
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search for services..."
                    className="w-full text-slate-800 text-sm py-2 bg-transparent border-none focus:ring-0"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 rounded-full px-6 font-bold h-9">
                  Search
                </Button>
              </form>
            </div>
          </section>

          {/* Service Categories */}
          <section className="grid grid-cols-4 sm:grid-cols-7 gap-3">
            {SERVICE_GRID.map((item, i) => (
              <Link key={i} href={item.href} className="flex flex-col items-center group">
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:shadow-md mb-2", item.bg, item.color)}>
                  <item.icon className="h-7 w-7" />
                </div>
                <span className="text-[10px] font-bold text-slate-700 text-center uppercase tracking-wider">{item.title}</span>
              </Link>
            ))}
          </section>

          {/* Promo Section (Where promo images are used) */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-[#466935] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md">
              <div className="relative z-10 space-y-4">
                <h3 className="text-base font-bold font-headline leading-tight">Healthy Pets<br/>Happier Lives</h3>
                <p className="text-[10px] opacity-80 max-w-[150px]">Book grooming, training, and more.</p>
                <Button variant="secondary" size="sm" className="rounded-full font-bold h-8 text-[10px] bg-white text-[#466935]">Explore <ArrowRight className="ml-2 h-3 w-3" /></Button>
              </div>
              <div className="absolute bottom-0 right-0 w-28 h-28 opacity-40 group-hover:scale-110 transition-transform">
                <Image src={placeholderImages.promos.promo1.url} alt="Promo 1" fill className="object-contain" data-ai-hint={placeholderImages.promos.promo1.hint} />
              </div>
            </Card>

            <Card className="bg-[#F8D2E2] text-[#802D52] border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md">
              <div className="relative z-10 space-y-4">
                 <h3 className="text-base font-bold font-headline leading-tight">Because Every Pet<br/>Deserves Love</h3>
                <Button size="sm" className="bg-[#802D52] text-white rounded-full font-bold h-8 text-[10px]">Community <ArrowRight className="ml-2 h-3 w-3" /></Button>
              </div>
              <div className="absolute bottom-0 right-0 w-28 h-28 opacity-40 group-hover:scale-110 transition-transform">
                <Image src={placeholderImages.promos.promo2.url} alt="Promo 2" fill className="object-contain" data-ai-hint={placeholderImages.promos.promo2.hint} />
              </div>
            </Card>

            <Card className="bg-[#0D2B2B] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group cursor-pointer shadow-md">
              <div className="relative z-10 space-y-4">
                <h3 className="text-base font-bold font-headline">Pet Reports</h3>
                <p className="text-[10px] opacity-80">Track health and habits.</p>
                <Button variant="secondary" size="sm" className="rounded-full font-bold h-8 text-[10px] bg-white text-[#0D2B2B]">View Reports <ArrowRight className="ml-2 h-3 w-3" /></Button>
              </div>
              <div className="absolute bottom-0 right-0 w-28 h-28 opacity-40 group-hover:scale-110 transition-transform">
                <Image src={placeholderImages.promos.promo3.url} alt="Promo 3" fill className="object-contain" data-ai-hint={placeholderImages.promos.promo3.hint} />
              </div>
            </Card>
          </section>

          {/* Local Featured Services */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold font-headline text-slate-900">Featured Services</h2>
              <Link href="/providers" className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase tracking-widest">
                View All <ArrowRight className="h-3 w-3" />
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
                      <div className="flex items-center gap-1 mt-1">
                         <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                         <span className="text-[9px] font-bold">{provider.rating}</span>
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
          {/* User & Pet Card */}
          <Card className="border-none shadow-sm rounded-[2rem] p-6 bg-white space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                  <AvatarImage src={userAvatar} className="object-cover" />
                  <AvatarFallback><UserIcon /></AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-lg font-bold font-headline text-slate-900 leading-tight">Hello, {displayName.split(' ')[0]}!</h2>
                  <p className="text-[10px] text-slate-400">Your pet's best life, every day.</p>
                </div>
              </div>
              <Settings className="h-4 w-4 text-slate-300 cursor-pointer" />
            </div>

            <div className="p-4 rounded-[1.5rem] border border-orange-100 bg-orange-50/30">
               <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-4 ring-white shadow-sm">
                    <AvatarImage src={petData?.avatar || "/images/logo.png"} className="object-cover" />
                    <AvatarFallback>B</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-bold text-slate-800 truncate">{petData?.name || 'Buddy'}</p>
                      <Badge variant="outline" className="text-[8px] bg-white border-orange-100 text-orange-600 font-bold px-1.5 py-0 h-4">Active</Badge>
                    </div>
                    <p className="text-[9px] text-slate-500 mt-0.5">{petData?.breed || 'Golden Retriever'} • {petData?.age || '3 years'}</p>
                  </div>
               </div>
            </div>
          </Card>

          {/* Recently Viewed */}
          <div className="space-y-4">
             <h3 className="font-bold text-[11px] uppercase tracking-widest text-slate-400 px-2">Recently Viewed</h3>
             <div className="space-y-3 px-1">
               {placeholderImages.recentlyViewed.map((item, i) => (
                 <div key={i} className="flex items-center gap-3 group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={item.url} className="object-cover" data-ai-hint={item.hint} />
                      <AvatarFallback>P</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-slate-800">{item.title}</p>
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

          {/* Community Callout */}
          <Card className="bg-[#0D2B2B] text-white border-none rounded-[2rem] overflow-hidden p-6 relative group shadow-lg">
             <div className="relative z-10 space-y-4">
                <h3 className="text-base font-bold leading-tight font-headline">Join Our PetMets Community</h3>
                <p className="text-[9px] opacity-70 max-w-[180px]">Share stories and find pet parents near you!</p>
                <Button variant="outline" size="sm" className="rounded-full font-bold flex items-center gap-2 h-9 text-[10px] px-6 bg-white text-[#0D2B2B] hover:bg-white/90 border-none">
                   Join Now <ArrowRight className="h-3 w-3" />
                </Button>
             </div>
             <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20 group-hover:scale-105 transition-transform">
               <Image src={placeholderImages.sidebar.community.url} alt="Community" fill className="object-contain" data-ai-hint={placeholderImages.sidebar.community.hint} />
             </div>
          </Card>

          {/* Trust Footer */}
          <div className="grid grid-cols-2 gap-4 p-4">
             {[
               { label: 'Trusted Vendors', icon: ShieldCheck },
               { label: 'Secure Payments', icon: CreditCard },
               { label: '24/7 Support', icon: Headphones },
               { label: 'Happy Community', icon: UsersIcon },
             ].map((item, i) => (
               <div key={i} className="flex items-center gap-2 opacity-60">
                  <item.icon className="h-4 w-4 text-slate-400" />
                  <span className="text-[9px] font-bold text-slate-700">{item.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
