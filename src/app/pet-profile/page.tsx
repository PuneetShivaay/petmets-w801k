
"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, User, Edit3, Mail, Phone, Home, Save, XCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

const petSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  breed: z.string().min(2, "Breed must be at least 2 characters.").max(50),
  age: z.string().min(1, "Age is required.").max(30),
  bio: z.string().max(200, "Bio cannot exceed 200 characters.").optional(),
});
type PetFormData = z.infer<typeof petSchema>;

const ownerSchema = z.object({
  name: z.string().min(2, "Display name must be at least 2 characters.").max(50),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type OwnerFormData = z.infer<typeof ownerSchema>;

const defaultPetData = {
    name: "Buddy",
    breed: "Golden Retriever",
    age: "3 years",
    avatar: "https://placehold.co/128x128.png",
    dataAiHint: "golden retriever",
    bio: "Loves long walks in the park and playing fetch. A very good boy indeed!",
};

const defaultOwnerData = {
    name: "Pet Owner",
    email: "loading...",
    phone: "",
    address: "",
    avatar: "https://placehold.co/128x128.png",
    dataAiHint: "friendly person",
};

export default function PetProfilePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);
  const [isSubmittingOwner, setIsSubmittingOwner] = useState(false);

  const [petData, setPetData] = useState(defaultPetData);
  const [ownerData, setOwnerData] = useState(defaultOwnerData);

  const { register: registerPet, handleSubmit: handlePetSubmit, reset: resetPetForm, formState: { errors: petErrors } } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
  });

  const { register: registerOwner, handleSubmit: handleOwnerSubmit, reset: resetOwnerForm, formState: { errors: ownerErrors } } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
  });

  const fetchProfileData = useCallback(async () => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const petDocRef = doc(db, "users", user.uid, "pets", "main-pet");

      const [userDocSnap, petDocSnap] = await Promise.all([
        getDoc(userDocRef),
        getDoc(petDocRef),
      ]);
      
      const fetchedOwnerData = userDocSnap.exists() ? userDocSnap.data() : {};
      const finalOwnerData = {
        ...defaultOwnerData,
        ...fetchedOwnerData,
        email: user.email!,
        name: user.displayName || fetchedOwnerData.name || defaultOwnerData.name
      };
      setOwnerData(finalOwnerData);
      resetOwnerForm(finalOwnerData);

      const fetchedPetData = petDocSnap.exists() ? petDocSnap.data() : {};
      const finalPetData = { ...defaultPetData, ...fetchedPetData };
      setPetData(finalPetData);
      resetPetForm(finalPetData);

    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast({ variant: "destructive", title: "Error", description: `Could not fetch profile data. Please check your connection. Error: ${(error as Error).message}` });
    } finally {
      setIsPageLoading(false);
    }
  }, [user, resetOwnerForm, resetPetForm, toast]);

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchProfileData();
    } else if (!isAuthLoading && !user) {
      // User is not logged in, no need to fetch, stop loading.
      // The main layout will handle the redirect.
      setIsPageLoading(false);
    }
  }, [user, isAuthLoading, fetchProfileData]);

  const onPetSubmit: SubmitHandler<PetFormData> = async (data) => {
    if (!user) {
        toast({ variant: "destructive", title: "Not Authenticated" });
        return;
    }
    setIsSubmittingPet(true);
    try {
      const petDocRef = doc(db, "users", user.uid, "pets", "main-pet");
      const dataToSave = { ...petData, ...data }; 
      
      await setDoc(petDocRef, dataToSave, { merge: true });
      
      setPetData(dataToSave);
      toast({ title: "Success", description: "Pet details updated." });
      setIsEditingPet(false);
    } catch (error) {
      console.error("Failed to update pet details:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update pet details." });
    } finally {
      setIsSubmittingPet(false);
    }
  };

  const onOwnerSubmit: SubmitHandler<OwnerFormData> = async (data) => {
    if (!user || !auth.currentUser) {
        toast({ variant: "destructive", title: "Not Authenticated" });
        return;
    }
    setIsSubmittingOwner(true);
    try {
      if (data.name !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }

      const userDocRef = doc(db, "users", user.uid);
      const dataToSave = { ...ownerData, ...data };

      await setDoc(userDocRef, dataToSave, { merge: true });
      
      setOwnerData(dataToSave);
      toast({ title: "Success", description: "Your profile has been updated." });
      setIsEditingOwner(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
    } finally {
      setIsSubmittingOwner(false);
    }
  };

  // The AuthProvider handles the main loading state. 
  // We show a skeleton here only for the initial data fetch on this page.
  if (isPageLoading) {
    return (
        <div>
            <PageHeader
                title="Pet & Owner Profile"
                description="View and manage your pet's details and your account information."
            />
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
            </div>
        </div>
    )
  }
  
  if (!user) {
      // This state is handled by AppLayout redirecting to /login.
      // This return prevents a flash of content while redirecting.
      return null;
  }

  return (
    <div>
      <PageHeader
        title="Pet & Owner Profile"
        description="View and manage your pet's details and your account information."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card className="shadow-lg">
          <form onSubmit={handlePetSubmit(onPetSubmit)}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                  <AvatarImage src={petData.avatar} alt={petData.name} data-ai-hint={petData.dataAiHint} />
                  <AvatarFallback><PawPrint className="h-10 w-10" /></AvatarFallback>
                </Avatar>
                <div>
                  {isEditingPet ? (
                     <Input id="petName" {...registerPet("name")} className="font-headline text-2xl sm:text-3xl p-2 h-auto" />
                  ) : (
                    <CardTitle className="font-headline text-2xl sm:text-3xl">{petData.name}</CardTitle>
                  )}
                  {petErrors.name && <p className="text-sm text-destructive">{petErrors.name.message}</p>}
                  
                  {isEditingPet ? (
                     <Input id="petBreed" {...registerPet("breed")} className="mt-1" />
                  ) : (
                    <p className="text-muted-foreground">{petData.breed}</p>
                  )}
                  {petErrors.breed && <p className="text-sm text-destructive">{petErrors.breed.message}</p>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingPet ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="petAge">Age</Label>
                    <Input id="petAge" {...registerPet("age")} />
                    {petErrors.age && <p className="text-sm text-destructive">{petErrors.age.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="petBio">Bio</Label>
                    <Textarea id="petBio" {...registerPet("bio")} rows={3} />
                    {petErrors.bio && <p className="text-sm text-destructive">{petErrors.bio.message}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Age</span>
                    <p className="text-base sm:text-lg">{petData.age}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Bio</span>
                    <p className="text-base italic text-foreground">{petData.bio || "No bio set."}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              {isEditingPet ? (
                <div className="flex w-full gap-2">
                  <Button type="submit" disabled={isSubmittingPet} className="flex-1">
                    {isSubmittingPet ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditingPet(false); resetPetForm(petData); }}>
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => { resetPetForm(petData); setIsEditingPet(true); }}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Pet Details
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>

        <Card className="shadow-lg">
          <form onSubmit={handleOwnerSubmit(onOwnerSubmit)}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-accent">
                  <AvatarImage src={ownerData.avatar} alt={ownerData.name} data-ai-hint={ownerData.dataAiHint} />
                  <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                </Avatar>
                <div>
                   {isEditingOwner ? (
                     <>
                      <Input id="ownerName" {...registerOwner("name")} className="font-headline text-2xl sm:text-3xl p-2 h-auto" />
                      {ownerErrors.name && <p className="text-sm text-destructive">{ownerErrors.name.message}</p>}
                     </>
                   ) : (
                    <CardTitle className="font-headline text-2xl sm:text-3xl">{ownerData.name}</CardTitle>
                   )}
                  <p className="text-muted-foreground">Pet Owner</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <p className="truncate text-base sm:text-lg">{ownerData.email}</p>
              </div>
              {isEditingOwner ? (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="ownerPhone">Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <Input id="ownerPhone" {...registerOwner("phone")} placeholder="555-123-4567" />
                    </div>
                     {ownerErrors.phone && <p className="text-sm text-destructive">{ownerErrors.phone.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="ownerAddress">Address</Label>
                    <div className="flex items-start gap-2">
                      <Home className="h-5 w-5 text-muted-foreground mt-2" />
                      <Input id="ownerAddress" {...registerOwner("address")} placeholder="123 Pet Street, Pawville" />
                    </div>
                     {ownerErrors.address && <p className="text-sm text-destructive">{ownerErrors.address.message}</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="text-base sm:text-lg">{ownerData.phone || "Not set"}</p>

                  </div>
                  <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-muted-foreground mt-1" />
                    <p className="text-base sm:text-lg">{ownerData.address || "Not set"}</p>
                  </div>
                </>
              )}
            </CardContent>
            <CardFooter>
              {isEditingOwner ? (
                 <div className="flex w-full gap-2">
                  <Button type="submit" disabled={isSubmittingOwner} className="flex-1">
                    {isSubmittingOwner ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setIsEditingOwner(false); resetOwnerForm({ name: ownerData.name, phone: ownerData.phone, address: ownerData.address }); }}>
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => { resetOwnerForm({ name: ownerData.name, phone: ownerData.phone, address: ownerData.address }); setIsEditingOwner(true); }}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Account Details
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>

      <Card className="mt-8 bg-primary/10">
        <CardContent className="p-6">
          <h3 className="font-headline text-xl font-semibold text-primary">Your Information Hub!</h3>
          <p className="mt-2 text-muted-foreground">
            Keep your pet's and your own information up-to-date. This helps us provide the best service and ensures smooth communication for bookings and emergencies.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
