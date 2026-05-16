"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { collection, addDoc, serverTimestamp, query, onSnapshot, orderBy } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useLoading } from "@/contexts/loading-context";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, PlusCircle, Loader2, MapPin } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const adoptionListingSchema = z.object({
  name: z.string().min(2, "Pet name must be at least 2 characters."),
  breed: z.string().min(2, "Breed is required."),
  age: z.string().min(1, "Age is required."),
  city: z.string().min(2, "City is required."),
  bio: z.string().min(10, "Please provide a short bio (at least 10 characters).").max(300),
});
type AdoptionListingFormData = z.infer<typeof adoptionListingSchema>;

interface AdoptionListing {
  id: string;
  ownerId: string;
  ownerEmail: string;
  name: string;
  breed: string;
  age: string;
  city: string;
  bio: string;
  image: string;
  dataAiHint: string;
  createdAt: any;
}

export default function AdoptionPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const { showLoading } = useLoading();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [listings, setListings] = useState<AdoptionListing[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  
  const isFormOpen = searchParams.get("add") === "true";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdoptionListingFormData>({
    resolver: zodResolver(adoptionListingSchema),
  });

  useEffect(() => {
    setIsLoadingListings(true);
    const listingsQuery = query(collection(db, "adoptionListings"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(listingsQuery, (snapshot) => {
      const listingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AdoptionListing));
      setListings(listingsData);
      setIsLoadingListings(false);
    }, (error) => {
      console.error("Error fetching adoption listings:", error);
      toast({ variant: "destructive", title: "Failed to load listings." });
      setIsLoadingListings(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const handleOpenForm = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("add", "true");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleCloseForm = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("add");
    router.back();
  };

  const handleLearnMore = (ownerId: string) => {
    showLoading();
    router.push(`/profile/${ownerId}`);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File', description: 'Please select an image.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'File Too Large', description: 'Image must be smaller than 5MB.' });
        return;
      }
      setImageFile(file);
    }
  };

  const onSubmit: SubmitHandler<AdoptionListingFormData> = async (data) => {
    if (!user) {
      toast({ variant: "destructive", title: "Authentication Required", description: "You must be logged in to list a pet." });
      return;
    }
    if (!imageFile) {
        toast({ variant: "destructive", title: "Image Required", description: "Please upload a photo of the pet." });
        return;
    }

    setIsSubmitting(true);
    try {
      const fileName = `${user.uid}_${Date.now()}_${imageFile.name}`;
      const imageRef = storageRef(storage, `adoption-listings/${fileName}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "adoptionListings"), {
        ...data,
        ownerId: user.uid,
        ownerEmail: user.email,
        image: downloadURL,
        dataAiHint: `${data.breed} pet`,
        createdAt: serverTimestamp(),
      });
      
      toast({ title: "Listing Created!", description: `${data.name} is now listed for adoption.` });
      
      reset();
      setImageFile(null);
      handleCloseForm();

    } catch (error) {
      console.error("Error creating adoption listing:", error);
      toast({ variant: "destructive", title: "Submission Failed", description: "Could not create the listing. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-muted-foreground md:max-w-2xl">Help a pet find its forever home. Browse available pets or list one for adoption.</p>
        <Button onClick={handleOpenForm} disabled={isAuthLoading} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" /> List a Pet for Adoption
        </Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleCloseForm()}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>List Your Pet for Adoption</DialogTitle>
            <DialogDescription>Fill out the details below to help your pet find a new home.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-6">
              <div className="grid gap-4 py-4">
                <div className="space-y-1">
                  <Label htmlFor="photo">Pet's Photo</Label>
                  <Input id="photo" type="file" accept="image/*" required ref={imageInputRef} onChange={handleImageSelect} />
                  {imageFile && <p className="text-xs text-muted-foreground">Selected: {imageFile.name}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="name">Pet's Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="breed">Breed</Label>
                    <Input id="breed" {...register("breed")} />
                    {errors.breed && <p className="text-sm text-destructive">{errors.breed.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" {...register("age")} placeholder="e.g., 2 years" />
                    {errors.age && <p className="text-sm text-destructive">{errors.age.message}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register("city")} placeholder="e.g., San Francisco, CA" />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-1 pb-4">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" {...register("bio")} rows={4} placeholder="Describe the pet's personality, needs, and history."/>
                  {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="p-6 border-t">
              <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Listing
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {isLoadingListings ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}><CardHeader><Skeleton className="h-52 w-full" /></CardHeader><CardContent><Skeleton className="h-6 w-3/4 mt-2" /><Skeleton className="h-4 w-1/2 mt-2" /></CardContent></Card>
          ))}
        </div>
      ) : listings.length === 0 ? (
         <Card className="text-center py-12 px-4">
            <CardContent>
                <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-lg font-medium">No Pets for Adoption Yet</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to list a pet and help them find a home!</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((pet) => (
            <Card key={pet.id} className="flex flex-col overflow-hidden rounded-lg shadow-lg">
              <div className="relative h-52 w-full">
                <Image src={pet.image || "/images/logo.png"} alt={pet.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{objectFit: 'cover'}} data-ai-hint={pet.dataAiHint} />
              </div>
              <CardHeader>
                <CardTitle className="font-headline text-lg sm:text-xl">{pet.name}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-4 w-4" /> {pet.city}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="font-semibold text-primary">{pet.breed} &bull; {pet.age}</p>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{pet.bio}</p>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" onClick={() => handleLearnMore(pet.ownerId)}>
                  <Heart className="mr-2 h-4 w-4" /> Learn More & Contact
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
