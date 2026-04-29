"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, onSnapshot, doc, setDoc, serverTimestamp, orderBy, where } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PawPrint, Star, Search, PlusCircle, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

const providerSchema = z.object({
  name: z.string().min(2, "Business name is required."),
  service: z.enum(["Walking", "Grooming", "Training", "Boarding", "Photography"]),
  bio: z.string().min(10, "Please provide a short description of your services.").max(500),
  location: z.string().min(2, "Location is required."),
});
type ProviderFormData = z.infer<typeof providerSchema>;

interface Provider {
  id: string;
  userId: string;
  name: string;
  service: string;
  bio: string;
  location: string;
  image: string;
  rating: number;
  createdAt: any;
}

export default function ServiceProvidersPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
  });

  useEffect(() => {
    const q = query(collection(db, "service_providers"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Provider));
      setProviders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching providers:", error);
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
        p.location.toLowerCase().includes(lower)
      );
    }
    setFilteredProviders(result);
  }, [providers, searchTerm, serviceFilter]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Image must be under 5MB." });
        return;
      }
      setImageFile(file);
    }
  };

  const onSubmit: SubmitHandler<ProviderFormData> = async (data) => {
    if (!user) return;
    if (!imageFile) {
      toast({ variant: "destructive", title: "Image required", description: "Please upload a business photo." });
      return;
    }

    setIsSubmitting(true);
    try {
      const imgRef = storageRef(storage, `service_providers/${user.uid}/profile_${Date.now()}.jpg`);
      const snapshot = await uploadBytes(imgRef, imageFile);
      const url = await getDownloadURL(snapshot.ref);

      const providerRef = doc(db, "service_providers", user.uid);
      await setDoc(providerRef, {
        ...data,
        userId: user.uid,
        image: url,
        rating: 5.0,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Registration Successful!", description: "You are now listed as a service provider." });
      setIsRegisterOpen(false);
      reset();
      setImageFile(null);
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({ 
        variant: "destructive", 
        title: "Registration Failed", 
        description: error.message || "An unexpected error occurred." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-muted-foreground">Browse profiles of pet walkers, groomers, trainers, and boarding facilities. View photos and book appointments.</p>
        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
          <DialogTrigger asChild>
            <Button disabled={authLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Register as Provider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Become a Service Provider</DialogTitle>
              <DialogDescription>Fill out your business details to start reaching pet owners in your area.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="space-y-1">
                <Label htmlFor="image">Business/Profile Photo</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageSelect} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Business Name</Label>
                <Input id="name" {...register("name")} placeholder="e.g., Happy Paws Grooming" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="service">Service Type</Label>
                  <Select onValueChange={(v) => reset({ ...register("service"), service: v as any })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Walking">Walking</SelectItem>
                      <SelectItem value="Grooming">Grooming</SelectItem>
                      <SelectItem value="Training">Training</SelectItem>
                      <SelectItem value="Boarding">Boarding</SelectItem>
                      <SelectItem value="Photography">Photography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="location">City/Location</Label>
                  <Input id="location" {...register("location")} placeholder="e.g., San Francisco, CA" />
                  {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Service Description</Label>
                <Textarea id="bio" {...register("bio")} rows={4} placeholder="Describe your experience..." />
                {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, bio or location..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="walking">Pet Walkers</SelectItem>
                <SelectItem value="grooming">Pet Groomers</SelectItem>
                <SelectItem value="training">Pet Trainers</SelectItem>
                <SelectItem value="boarding">Pet Boarding</SelectItem>
                <SelectItem value="photography">Pet Photography</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i}><Skeleton className="h-52 w-full" /><CardContent className="p-4"><Skeleton className="h-6 w-3/4 mb-2" /><Skeleton className="h-4 w-1/2" /></CardContent></Card>
          ))
        ) : filteredProviders.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">No Providers Found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters or register as a provider!</p>
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <Card key={provider.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-52 w-full">
                <Image 
                  src={provider.image} 
                  alt={provider.name} 
                  fill 
                  style={{objectFit: 'cover'}}
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg font-headline">{provider.name}</CardTitle>
                <p className="text-sm font-semibold text-primary">{provider.service}</p>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <div className="flex items-center gap-1 text-sm mb-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{provider.rating} stars</span>
                  <span className="mx-2 text-muted-foreground">|</span>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{provider.location}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 italic">
                  "{provider.bio}"
                </p>
              </CardContent>
              <CardFooter className="p-4">
                <Button variant="outline" className="w-full">
                  <PawPrint className="mr-2 h-4 w-4" /> Contact Provider
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}