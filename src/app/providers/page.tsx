
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
import { useLoading } from "@/contexts/loading-context";
import { cn } from "@/lib/utils";

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
  const { showLoading } = useLoading();
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
    showLoading();
    router.push(`/providers/${providerId}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline tracking-tight text-slate-900">Expert Pet Care Nearby</h1>
        <p className="text-slate-500 max-w-2xl">Find the best local professionals to pamper, train, and walk your furry friends. Every vendor is verified for your peace of mind.</p>
      </div>

      {/* Filter Bar */}
      <section className="sticky top-20 z-30 flex flex-col gap-4 bg-[#F8FAFC]/80 backdrop-blur-md py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Search by name, bio or location..." 
              className="pl-12 bg-white border-none shadow-sm rounded-2xl h-14 focus-visible:ring-primary/20" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2">
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-full h-14 rounded-2xl bg-white border-none shadow-sm font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Select Category" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-xl">
                {SERVICE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="font-bold py-3">
                    <div className="flex items-center gap-2">
                      <cat.icon className={cn("h-4 w-4", serviceFilter === cat.value ? "text-primary" : "text-slate-400")} />
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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-white">
              <Skeleton className="h-56 w-full" />
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredProviders.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-sm">
            <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-slate-200 mb-6">
              <Search className="h-10 w-10" />
            </div>
            <p className="text-xl font-bold text-slate-900">No matching providers found</p>
            <p className="text-slate-500 mt-2">Try adjusting your filters or search terms.</p>
            <Button variant="link" className="mt-4 text-primary font-bold" onClick={() => { setSearchTerm(""); setServiceFilter("all"); }}>
              Clear all filters
            </Button>
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <Card key={provider.id} className="group flex flex-col overflow-hidden rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border-none bg-white">
              <div className="relative h-56 w-full overflow-hidden">
                <Image 
                  src={provider.image} 
                  alt={provider.name} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 border-none shadow-lg px-3 py-1 rounded-full font-bold text-[10px]" variant="secondary">
                  {provider.service}
                </Badge>
                <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-xs text-slate-900">{provider.rating}</span>
                </div>
              </div>
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-xl font-bold font-headline text-slate-900 leading-tight">{provider.name}</CardTitle>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate">{provider.location}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-6 pt-2">
                <p className="text-sm text-slate-500 line-clamp-3 italic leading-relaxed">
                  "{provider.bio}"
                </p>
              </CardContent>
              <CardFooter className="p-6 pt-0">
                <Button className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md group-hover:shadow-lg" onClick={() => handleOpenDetails(provider.id)}>
                    View Full Profile & Book
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
