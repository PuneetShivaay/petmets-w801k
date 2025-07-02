
"use client";

import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile } from "firebase/auth";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, User, Edit3, Mail, Phone, Home, Save, XCircle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { auth } from "@/lib/firebase";
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

export default function PetProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isEditingPet, setIsEditingPet] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);
  const [isSubmittingOwner, setIsSubmittingOwner] = useState(false);

  // Use state for data to allow UI updates
  const [petData, setPetData] = useState({
    name: "Buddy",
    breed: "Golden Retriever",
    age: "3 years",
    avatar: "https://placehold.co/128x128.png",
    dataAiHint: "golden retriever",
    bio: "Loves long walks in the park and playing fetch. A very good boy indeed!",
  });

  const [ownerData, setOwnerData] = useState({
    name: user?.displayName || "Pet Owner",
    email: user?.email || "loading...",
    phone: "555-123-4567",
    address: "123 Pet Street, Pawville, CA 90210",
    avatar: "https://placehold.co/128x128.png",
    dataAiHint: "friendly person",
  });

  const { register: registerPet, handleSubmit: handlePetSubmit, reset: resetPetForm, formState: { errors: petErrors } } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
    defaultValues: petData,
  });

  const { register: registerOwner, handleSubmit: handleOwnerSubmit, reset: resetOwnerForm, formState: { errors: ownerErrors } } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
  });

  useEffect(() => {
    if (user) {
      const initialOwnerData = {
        name: user.displayName || "Pet Owner",
        email: user.email || "No email provided",
        phone: ownerData.phone,
        address: ownerData.address,
        avatar: ownerData.avatar,
        dataAiHint: ownerData.dataAiHint,
      };
      setOwnerData(initialOwnerData);
      resetOwnerForm({ name: initialOwnerData.name, phone: initialOwnerData.phone, address: initialOwnerData.address });
    }
    resetPetForm(petData);
  }, [user, authLoading]); // Re-run when auth state is resolved

  const onPetSubmit: SubmitHandler<PetFormData> = async (data) => {
    setIsSubmittingPet(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    setPetData(prev => ({ ...prev, ...data }));
    toast({ title: "Success", description: "Pet details updated." });
    setIsEditingPet(false);
    setIsSubmittingPet(false);
  };

  const onOwnerSubmit: SubmitHandler<OwnerFormData> = async (data) => {
    if (!user) return toast({ variant: "destructive", title: "Not Authenticated" });
    setIsSubmittingOwner(true);
    try {
      await updateProfile(user, { displayName: data.name });
      setOwnerData(prev => ({ ...prev, name: data.name || prev.name, phone: data.phone || prev.phone, address: data.address || prev.address }));
      toast({ title: "Success", description: "Your profile has been updated." });
      setIsEditingOwner(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
    } finally {
      setIsSubmittingOwner(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Pet & Owner Profile"
        description="View and manage your pet's details and your account information."
      />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Pet Profile Card */}
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
                  {isEditingPet ? (
                     <Input id="petBreed" {...registerPet("breed")} className="mt-1" />
                  ) : (
                    <p className="text-muted-foreground">{petData.breed}</p>
                  )}
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
                    <p className="text-base italic text-foreground">{petData.bio}</p>
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
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsEditingPet(true)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Pet Details
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>

        {/* Owner Profile Card */}
        <Card className="shadow-lg">
          <form onSubmit={handleOwnerSubmit(onOwnerSubmit)}>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-accent">
                  <AvatarImage src={ownerData.avatar} alt={ownerData.name} data-ai-hint={ownerData.dataAiHint} />
                  <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                </Avatar>
                <div>
                  {authLoading ? <Skeleton className="h-8 w-40" /> :
                   isEditingOwner ? <Input id="ownerName" {...registerOwner("name")} className="font-headline text-2xl sm:text-3xl p-2 h-auto" />
                   : <CardTitle className="font-headline text-2xl sm:text-3xl">{ownerData.name}</CardTitle>
                  }
                  <p className="text-muted-foreground">Pet Owner</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                {authLoading ? <Skeleton className="h-6 w-48" /> : <p className="truncate text-base sm:text-lg">{ownerData.email}</p>}
              </div>
              {isEditingOwner ? (
                <>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <Input id="ownerPhone" {...registerOwner("phone")} />
                  </div>
                  <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-muted-foreground mt-2" />
                    <Input id="ownerAddress" {...registerOwner("address")} />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="text-base sm:text-lg">{ownerData.phone} <span className="text-xs text-muted-foreground">(Placeholder)</span></p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-muted-foreground mt-1" />
                    <p className="text-base sm:text-lg">{ownerData.address} <span className="text-xs text-muted-foreground">(Placeholder)</span></p>
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
                  <Button type="button" variant="outline" onClick={() => { setIsEditingOwner(false); resetOwnerForm({name: ownerData.name, phone: ownerData.phone, address: ownerData.address }); }}>
                    <XCircle className="mr-2 h-4 w-4" /> Cancel
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" className="w-full" onClick={() => setIsEditingOwner(true)}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Account Details
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>

      <Card className="mt-8 bg-primary/10">
        <CardContent className="p-6">
          <h3 className="font-headline text-xl font-semibold text-primary">Keep Your Information Up-to-Date!</h3>
          <p className="mt-2 text-muted-foreground">
            Regularly updating your pet's and your own information helps us provide the best service and ensures smooth communication for bookings and emergencies. Other details like your phone, and address are currently placeholders but can be edited.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
