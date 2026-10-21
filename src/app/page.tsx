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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Surface,
  Chip,
  PillButton,
  EmptyState,
  SectionHeader,
  OverlineHeader,
  PromoCard,
  ServiceTile,
} from "@/components/design";
import { text, type ServiceKey } from "@/theme/variants";
import { 
  type LucideIcon,
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

const SERVICE_GRID: { service: ServiceKey; title: string; icon: LucideIcon; href: string; desc: string }[] = [
  { service: 'match', title: 'Match Your Pet', icon: Heart, href: '/match', desc: 'Find the perfect companion' },
  { service: 'walker', title: 'Pet Walker', icon: UserIcon, href: '/providers?service=Walking', desc: 'Safe & trusted walkers' },
  { service: 'training', title: 'Pet Training', icon: GraduationCap, href: '/providers?service=Training', desc: 'Better behavior, stronger bond' },
  { service: 'grooming', title: 'Pet Grooming', icon: Scissors, href: '/providers?service=Grooming', desc: 'Clean, fresh & happy pets' },
  { service: 'boarding', title: 'Pet Boarding', icon: HomeIcon, href: '/providers?service=Boarding', desc: 'Safe stays, loving care' },
  { service: 'reports', title: 'Pet Reports', icon: FileTextIcon, href: '/records', desc: 'Health, activity & more' },
  { service: 'playzone', title: 'Pet Playzone', icon: Activity, href: '/playzone', desc: 'Play, socialize, make friends' },
];

const RECENTLY_VIEWED = [
  { title: 'Dog Grooming', price: '₹1,499', rating: '4.8', image: 'https://picsum.photos/seed/grooming/100/100' },
  { title: 'Pet Boarding', price: '₹699/day', rating: '4.9', image: 'https://picsum.photos/seed/boarding/100/100' },
];

function Rating({ value, iconClass = 'h-3 w-3', textClass = 'text-caption' }: { value: string | number; iconClass?: string; textClass?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      <Star className={cn(iconClass, 'fill-rating text-rating')} />
      <span className={cn(textClass, 'font-bold text-muted-foreground')}>{value}</span>
    </div>
  );
}

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
        <Skeleton className="h-[180px] w-full rounded-card" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-card" />)}
        </div>
      </div>
    );
  }

  const displayName = userData?.name || user?.displayName || 'Ghanist';
  const userAvatar = userData?.avatar || user?.photoURL || "https://picsum.photos/seed/userhead/100/100";

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-[1400px] mx-auto w-full">
        
        {/* Main Content Area */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Hero Banner */}
          <section className="relative rounded-card overflow-hidden aspect-[2.8/1] shadow-card group border border-white">
            <Image 
              src={placeholderImages.hero.dashboard.url} 
              alt="Happy pets enjoying PetMets premium services" 
              fill 
              sizes="(max-width: 1024px) 100vw, 75vw"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent flex flex-col justify-center px-6 md:px-12">
               <div className="max-w-md hidden md:block">
                  <h1 className="text-white text-3xl md:text-4xl font-black font-headline leading-tight drop-shadow-lg">
                    Pet Premium Services
                  </h1>
                  <p className="text-white/80 text-label font-bold mt-2 tracking-wide uppercase">
                    Because they're more than just pets, they're family.
                  </p>
               </div>
              <form onSubmit={handleHeroSearch} className="mt-2 md:mt-8 flex items-center bg-card rounded-pill p-0.5 md:p-1 shadow-lg w-full max-w-lg">
                <div className="flex flex-1 items-center px-2 md:px-4">
                  <Search className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground mr-1 md:mr-2" />
                  <input 
                    type="text" 
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search for services..."
                    className="w-full text-label md:text-xs py-1 md:py-2.5 bg-transparent border-none focus:ring-0 placeholder:text-muted-foreground"
                  />
                </div>
                <PillButton type="submit" tone="primary" size="lg">
                  Search
                </PillButton>
              </form>
            </div>
          </section>

          {/* Service Grid Icons */}
          <section className="grid grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
            {SERVICE_GRID.map((item) => (
              <ServiceTile key={item.service} service={item.service} icon={item.icon} title={item.title} description={item.desc} href={item.href} />
            ))}
          </section>

          {/* Promo Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PromoCard
              tone="forest"
              title={<>Healthy Pets<br/>Happier Lives</>}
              description="Book grooming, training, boarding and more."
              ctaLabel="Explore Services"
              href="/providers"
              imageUrl={placeholderImages.promos.promo1.url}
              imageAlt="Pet getting groomed"
            />
            <PromoCard
              tone="rose"
              eyebrow="Pet Store"
              title={<>Every Pet<br/>Deserves<br/>Love</>}
              ctaLabel="Explore Store"
              href="/providers"
              imageUrl={placeholderImages.promos.promo2.url}
              imageAlt="Pet store products"
            />
            <PromoCard
              tone="ink"
              icon={FileTextIcon}
              title="Pet Reports"
              description="Track health, activity, habits & more."
              ctaLabel="View Reports"
              href="/records"
              imageUrl={placeholderImages.promos.promo3.url}
              imageAlt="Pet health report"
            />
          </section>

          {/* Featured Services */}
          <section className="space-y-4">
            <SectionHeader title="Featured Services" href="/providers" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {localProviders.map((provider) => (
                <Link key={provider.id} href={`/providers/${provider.id}`}>
                  <Surface variant="interactive" padding="none">
                    <div className="relative aspect-square">
                      <Image 
                        src={provider.image || `https://picsum.photos/seed/${provider.id}/300/300`} 
                        alt={provider.name} 
                        fill 
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 12vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      />
                    </div>
                    <CardContent className="p-2 md:p-3 space-y-1">
                      <p className="text-caption md:text-label font-bold text-foreground truncate leading-none">{provider.name}</p>
                      <Rating value={provider.rating || '4.8'} iconClass="h-2 w-2" textClass="text-overline md:text-caption" />
                    </CardContent>
                  </Surface>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* User & Pets Section */}
          <Surface padding="md" className="border border-white space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-muted shadow-card">
                  <AvatarImage src={userAvatar} className="object-cover" />
                  <AvatarFallback className="bg-service-walker-soft text-service-walker font-bold">{displayName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-sm font-bold text-foreground leading-tight">Hello, {displayName.split(' ')[0]}!</h2>
                  <p className="text-overline md:text-caption text-muted-foreground font-medium">A better life for your pet.</p>
                </div>
              </div>
              <Settings className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground cursor-pointer" onClick={() => router.push('/pet-profile')} />
            </div>

            <div className="space-y-3">
               <Link href="/pet-profile" className="flex items-center gap-3 p-2 bg-surface-subtle rounded-card border border-muted group cursor-pointer hover:bg-card transition-all">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-card">
                    <AvatarImage src={petData?.avatar || "https://picsum.photos/seed/buddy/100/100"} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{petData?.name?.[0] || 'B'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-label font-bold text-foreground truncate leading-none">{petData?.name || 'Buddy'}</p>
                    <p className="text-micro text-muted-foreground mt-1 uppercase tracking-tighter">
                      {petData?.breed || 'Golden Retriever'} • {petData?.age || '2y'}
                    </p>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground/60" />
               </Link>
            </div>
          </Surface>

          {/* Upcoming Bookings */}
          <div className="space-y-4 px-1">
             <OverlineHeader title="Upcoming Bookings" href="/bookings" />
             
             {upcomingBookings.length > 0 ? (
               upcomingBookings.map((booking) => (
                 <Link key={booking.id} href="/bookings">
                    <Surface variant="interactive" padding="sm" className="relative">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg overflow-hidden shadow-card shrink-0">
                           <Image 
                             src={booking.providerImageUrl || `https://picsum.photos/seed/${booking.id}/100/100`} 
                             alt="Provider" 
                             width={36} height={36} className="object-cover" 
                           />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-caption font-bold text-foreground truncate leading-none">{booking.serviceType || 'Pet Walker'}</p>
                          <p className="text-micro text-muted-foreground font-medium mt-1">Today • {booking.time || '5:00 PM'}</p>
                        </div>
                        <Chip tone="success">Confirmed</Chip>
                      </div>
                    </Surface>
                 </Link>
               ))
             ) : (
               <EmptyState>No Bookings</EmptyState>
             )}
          </div>

          {/* New to PetMets */}
          <Surface padding="md" className="bg-brand-cream relative group">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-brand-amber flex items-center gap-2">
                  <Ticket className="h-4 w-4" />
                  New to PetMets?
                </h3>
                <p className="text-xs text-foreground/80 font-medium leading-snug">
                  Get <span className="font-bold text-primary">50% off</span> on your first<br/>service booking!
                </p>
                <PillButton tone="primary" size="md" className="mt-2">
                  Explore Now
                </PillButton>
              </div>
              <div className="w-24 h-24 absolute -bottom-5 -right-5 opacity-50">
                <Image src={placeholderImages.hero.dashboard.url} alt="New to PetMets" fill sizes="(max-width: 1024px) 100vw, 25vw" className="object-cover" />
              </div>
            </div>
          </Surface>
          
          {/* Recently Viewed */}
          <div className="space-y-4 px-1">
             <OverlineHeader title="Recently Viewed" href="/providers" />
             <div className="space-y-3">
              {RECENTLY_VIEWED.map((item) => (
                <Surface key={item.title} variant="interactive" padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden shadow-card shrink-0">
                       <Image src={item.image} alt={item.title} width={48} height={48} className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={text.itemTitle}>{item.title}</p>
                      <p className={cn(text.itemMeta, 'text-overline mt-1')}>{item.price}</p>
                    </div>
                    <Rating value={item.rating} />
                  </div>
                </Surface>
              ))}
             </div>
          </div>

          {/* Join Community Card */}
          <Surface padding="none" className="bg-accent text-accent-foreground relative group">
             <div className="p-5 relative z-10 space-y-3">
                <h4 className="text-label md:text-label-lg font-bold leading-tight">Join Our PetMets Community</h4>
                <p className="text-overline md:text-caption opacity-70 font-medium leading-relaxed max-w-[150px]">
                  Share stories and get expert tips!
                </p>
                <Link href="/match" className="inline-block">
                  <PillButton tone="light" size="xs" className="text-accent">
                    Join Now <ArrowRight className="ml-1 h-2.5 w-2.5" />
                  </PillButton>
                </Link>
             </div>
             <div className="absolute -bottom-2 -right-2 w-20 h-20 opacity-30 group-hover:scale-110 transition-transform">
                <Image src={placeholderImages.sidebar.community.url} alt="Community" fill sizes="(max-width: 1024px) 100vw, 25vw" className="object-cover" />
             </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
