
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PawPrint, Star, Search, MapPin, Loader2, Filter, Sparkles, Navigation } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PageContainer, PageHeader, Surface } from "@/components/design";
import { buttonTone, filterControl, imageOverlayPill, layout } from "@/theme/variants";

interface Provider {
  id: string;
  name: string;
  service: string;
  bio: string;
  location: string;
  image: string;
  rating: number;
  createdAt: any;
}

const SERVICE_CATEGORIES = [
  { value: "all", label: "All Services", icon: Sparkles },
  { value: "Walking", label: "Walkers", icon: Navigation },
  { value: "Grooming", label: "Groomers", icon: PawPrint },
  { value: "Training", label: "Trainers", icon: Sparkles },
  { value: "Boarding", label: "Boarding", icon: MapPin },
  { value: "Photography", label: "Photos", icon: Sparkles },
  { value: "Playzone", label: "Playzone", icon: Sparkles },
];

export default function ServiceProvidersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const initialFilter = searchParams.get("service") || "all";
  const [serviceFilter, setServiceFilter] = useState(initialFilter);

  useEffect(() => {
    const q = query(collection(db, "service_providers"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      setProviders(data);
      setLoading(false);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'service_providers',
        operation: 'list'
      }));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = providers;
    if (serviceFilter !== "all") {
      result = result.filter(p => p.service.toLowerCase() === serviceFilter.toLowerCase());
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.bio.toLowerCase().includes(lower) || 
        p.location.toLowerCase().includes(lower) ||
        p.service.toLowerCase().includes(lower)
      );
    }
    setFilteredProviders(result);
  }, [providers, searchTerm, serviceFilter]);

  const handleOpenDetails = (providerId: string) => {
    router.push(`/providers/${providerId}`);
  };

  return (
    <PageContainer className="space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Expert Pet Care Nearby"
        subtitle="Find the best local professionals to pamper, train, and walk your furry friends. Every vendor is verified for your peace of mind."
      />

      {/* Filter Bar */}
      <section className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name, bio or location..." 
              className={cn(filterControl, "pl-12")} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2">
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className={cn(filterControl, "w-full font-bold text-foreground")}>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Select Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-card border-none shadow-card-hover">
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="font-bold py-3">
                    <div className="flex items-center gap-2">
                      <cat.icon className={cn("h-4 w-4", serviceFilter === cat.value ? "text-primary" : "text-muted-foreground")} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Results Grid */}
      <div className={layout.cardGrid}>
        {loading ? (
          [...Array(10)].map((_, i) => (
            <Surface key={i} padding="none">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Surface>
          ))
        ) : filteredProviders.length === 0 ? (
          <Surface variant="empty" padding="none" className="col-span-full py-24">
            <div className="h-16 w-16 bg-surface-subtle rounded-card flex items-center justify-center mx-auto text-muted-foreground/40 mb-6">
              <Search className="h-8 w-8" />
            </div>
            <p className="text-xl font-bold text-foreground">No matching providers found</p>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
            <Button variant="link" className="mt-4 text-primary font-bold" onClick={() => { setSearchTerm(""); setServiceFilter("all"); }}>
              Clear all filters
            </Button>
          </Surface>
        ) : (
          filteredProviders.map((provider) => (
            <Surface
              key={provider.id}
              variant="interactive"
              padding="none"
              className="flex flex-col"
              onClick={() => handleOpenDetails(provider.id)}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image 
                  src={provider.image || "/images/logo.png"} 
                  alt={provider.name} 
                  fill 
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className={cn(imageOverlayPill, "absolute top-2 left-2 px-2 py-0.5 text-caption")}>
                  {provider.service}
                </span>
                <div className={cn(imageOverlayPill, "absolute bottom-2 right-2 flex items-center gap-1 px-2 py-0.5")}>
                  <Star className="h-3 w-3 fill-rating text-rating" />
                  <span className="text-caption">{provider.rating}</span>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-3">
                <h3 className="font-headline text-sm sm:text-base font-bold leading-tight text-foreground truncate">{provider.name}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 shrink-0 text-primary" />
                  <span className="truncate">{provider.location}</span>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 flex-1">{provider.bio}</p>
                <Button
                  size="sm"
                  className={cn(buttonTone.dark, "mt-3 w-full text-xs")}
                  onClick={(e) => { e.stopPropagation(); handleOpenDetails(provider.id); }}
                >
                  View & Book
                </Button>
              </div>
            </Surface>
          ))
        )}
      </div>
    </PageContainer>
  );
}
