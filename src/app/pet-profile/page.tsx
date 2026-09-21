"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, type SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Dog, 
  User, 
  Edit3, 
  Mail, 
  Phone, 
  Home, 
  Save, 
  XCircle, 
  Loader2, 
  Upload, 
  ShieldCheck, 
  Heart, 
  Award,
  Zap,
  Calendar,
  MoreVertical
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

import { auth, db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { cn } from "@/lib/utils";

const petSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50),
  breed: z.string().min(2, "Breed must be at least 2 characters.").max(50),
  age: z.string().min(1, "Age is required.").max(30),
  gender: z.enum(["Male", "Female"], { required_error: "Please select your pet's gender." }),
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
    gender: "Male" as "Male" | "Female",
    avatar: "/images/logo.png",
    dataAiHint: "golden retriever",
    bio: "Loves long walks in the park and playing fetch. A very good boy indeed!",
};

const defaultOwnerData = {
    name: "Pet Parent",
    email: "loading...",
    phone: "",
    address: "",
    avatar: "/images/logo.png",
    dataAiHint: "parent profile",
};

export default function PetProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const petAvatarInputRef = useRef<HTMLInputElement>(null);
  const ownerAvatarInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditingPet, setIsEditingPet] = useState(false);
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [isSubmittingPet, setIsSubmittingPet] = useState(false);
  const [isSubmittingOwner, setIsSubmittingOwner] = useState(false);
  const [isUploadingPetAvatar, setIsUploadingPetAvatar] = useState(false);
  const [isUploadingOwnerAvatar, setIsUploadingOwnerAvatar] = useState(false);


  const [petData, setPetData] = useState<any>(defaultPetData);
  const [ownerData, setOwnerData] = useState<any>(defaultOwnerData);

  const { control: petControl, register: registerPet, handleSubmit: handlePetSubmit, reset: resetPetForm, formState: { errors: petErrors } } = useForm<PetFormData>({
    resolver: zodResolver(petSchema),
  });

  const { register: registerOwner, handleSubmit: handleOwnerSubmit, reset: resetOwnerForm, formState: { errors: ownerErrors } } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
  });

  const fetchProfileData = useCallback(async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      const petDocRef = doc(db, "pets", user.uid);

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

    } catch (error: any) {
      if (error.code === 'permission-denied') {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `users/${user.uid}`,
          operation: 'get'
        }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, resetOwnerForm, resetPetForm]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onPetSubmit: SubmitHandler<PetFormData> = async (data) => {
    if (!user) return;
    setIsSubmittingPet(true);
    const petDocRef = doc(db, "pets", user.uid);
    const dataToSave = { 
      ...petData, 
      ...data, 
      userId: user.uid,
      updatedAt: serverTimestamp(),
      createdAt: petData.createdAt || serverTimestamp()
    }; 
    
    setDoc(petDocRef, dataToSave, { merge: true })
      .then(() => {
        setPetData(dataToSave);
        toast({ title: "Profile Updated", description: `${data.name}'s details have been saved.` });
        setIsEditingPet(false);
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: petDocRef.path,
          operation: 'update',
          requestResourceData: dataToSave,
        }));
      })
      .finally(() => {
        setIsSubmittingPet(false);
      });
  };

  const onOwnerSubmit: SubmitHandler<OwnerFormData> = async (data) => {
    if (!user || !auth.currentUser) return;
    setIsSubmittingOwner(true);
    try {
      if (data.name !== auth.currentUser.displayName) {
        await updateProfile(auth.currentUser, { displayName: data.name });
      }

      const userDocRef = doc(db, "users", user.uid);
      const dataToSave = { ...ownerData, ...data, updatedAt: serverTimestamp() };

      setDoc(userDocRef, dataToSave, { merge: true })
        .then(() => {
          setOwnerData(dataToSave);
          toast({ title: "Account Updated", description: "Your contact information has been saved." });
          setIsEditingOwner(false);
        })
        .catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: dataToSave,
          }));
        });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Error", description: "Failed to update profile." });
    } finally {
        setIsSubmittingOwner(false);
    }
  };
  
  const handlePetAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;
    const file = event.target.files[0];
    
    setIsUploadingPetAvatar(true);
    try {
      const avatarRef = storageRef(storage, `users/${user.uid}/pets/avatar.jpg`);
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const petDocRef = doc(db, "pets", user.uid);
      const updateData = { avatar: downloadURL };

      setDoc(petDocRef, updateData, { merge: true })
        .then(() => {
          setPetData((prev: any) => ({ ...prev, avatar: downloadURL }));
          toast({ title: 'Avatar Updated!', description: "Pet's new picture is saved." });
        })
        .catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: petDocRef.path,
            operation: 'update',
            requestResourceData: updateData,
          }));
        });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Error uploading image.' });
    } finally {
      setIsUploadingPetAvatar(false);
    }
  };
  
  const handleOwnerAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;
    const file = event.target.files[0];

    setIsUploadingOwnerAvatar(true);
    try {
      const avatarRef = storageRef(storage, `users/${user.uid}/owner/avatar.jpg`);
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const userDocRef = doc(db, "users", user.uid);
      const updateData = { avatar: downloadURL };

      setDoc(userDocRef, updateData, { merge: true })
        .then(async () => {
          // Also update the Auth profile so the photoURL is synced globally
          if (auth.currentUser) {
            await updateProfile(auth.currentUser, { photoURL: downloadURL });
          }
          setOwnerData((prev: any) => ({ ...prev, avatar: downloadURL }));
          toast({ title: 'Profile Updated!', description: 'Your new picture is saved.' });
        })
        .catch(async (error) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'update',
            requestResourceData: updateData,
          }));
        });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Upload Failed', description: 'Error uploading image.' });
    } finally {
      setIsUploadingOwnerAvatar(false);
    }
  };

  if (isLoading) {
    return (
        <div className="space-y-4 max-w-5xl mx-auto p-4">
            <Skeleton className="h-10 w-1/3" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Skeleton className="h-[250px] w-full rounded-xl" />
                <Skeleton className="h-[250px] w-full rounded-xl" />
            </div>
        </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl md:text-2xl font-bold font-headline tracking-tight text-slate-900">Pet Identity Hub</h1>
          <p className="text-xs md:text-sm text-slate-500">Manage your pet's digital ID and your parent account settings.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-2.5 py-0.5 h-fit text-[9px]">
            <ShieldCheck className="h-3 w-3 mr-1" /> Verified Parent
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Pet Digital ID Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="relative overflow-hidden rounded-xl border-none shadow-sm bg-white group transition-all duration-500">
            <form onSubmit={handlePetSubmit(onPetSubmit)}>
              <CardHeader className="p-5 md:p-8 bg-slate-50/50 border-b border-dashed">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group/avatar">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-md ring-2 ring-primary/5">
                      <AvatarImage src={petData.avatar} alt={petData.name} className="object-cover" />
                      <AvatarFallback className="bg-orange-50"><Dog className="h-10 w-10 text-primary" /></AvatarFallback>
                    </Avatar>
                    <input type="file" ref={petAvatarInputRef} onChange={handlePetAvatarUpload} className="hidden" accept="image/*" disabled={isUploadingPetAvatar} />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white shadow-md border-none"
                      onClick={() => petAvatarInputRef.current?.click()}
                      disabled={isUploadingPetAvatar}
                    >
                      {isUploadingPetAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left space-y-0.5">
                    {isEditingPet ? (
                      <div className="space-y-1.5">
                        <Input id="petName" {...registerPet("name")} className="font-headline text-xl h-auto py-1 bg-white border-primary/20" placeholder="Pet Name" />
                        <Input id="petBreed" {...registerPet("breed")} className="h-7 text-xs bg-white border-primary/10" placeholder="Breed" />
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold font-headline text-slate-900 leading-tight">{petData.name}</h2>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                           <Badge variant="secondary" className="bg-primary text-white border-none px-2 py-0.5 font-bold text-[9px]">{petData.breed}</Badge>
                           <Badge variant="outline" className="border-slate-200 text-slate-500 text-[9px]">{petData.gender}</Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 md:p-8 space-y-6">
                {isEditingPet ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Age / DOB</Label>
                      <Input id="petAge" {...registerPet("age")} className="h-9 rounded-lg bg-slate-50 border-none text-xs" />
                      {petErrors.age && <p className="text-[9px] text-destructive">{petErrors.age.message}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Gender</Label>
                      <Controller
                        control={petControl}
                        name="gender"
                        render={({ field }) => (
                          <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-2 h-9 items-center">
                            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg flex-1 justify-center border border-transparent has-[:checked]:border-primary/20 transition-all">
                              <RadioGroupItem value="Male" id="male" />
                              <Label htmlFor="male" className="cursor-pointer font-bold text-[10px]">Male</Label>
                            </div>
                            <div className="flex items-center space-x-1.5 bg-slate-50 px-2 py-1 rounded-lg flex-1 justify-center border border-transparent has-[:checked]:border-primary/20 transition-all">
                              <RadioGroupItem value="Female" id="female" />
                              <Label htmlFor="female" className="cursor-pointer font-bold text-[10px]">Female</Label>
                            </div>
                          </RadioGroup>
                        )}
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label className="text-[9px] font-bold uppercase tracking-widest text-slate-400">About {petData.name}</Label>
                      <Textarea id="petBio" {...registerPet("bio")} rows={3} className="rounded-lg bg-slate-50 border-none resize-none text-xs" placeholder="Describe personality..." />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-0.5">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Age Range
                          </p>
                          <p className="text-base font-bold text-slate-800">{petData.age}</p>
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                            <Heart className="h-3 w-3" /> Personality
                          </p>
                          <p className="text-base font-bold text-slate-800">Friendly & Active</p>
                       </div>
                    </div>
                    
                    <div className="space-y-1.5">
                       <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Quick Bio</p>
                       <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-primary/20 pl-3 py-0.5">
                         "{petData.bio || 'No bio shared yet.'}"
                       </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                       <div className="p-2 rounded-lg bg-green-50 flex items-center gap-1.5 justify-center">
                          <Zap className="h-3 w-3 text-green-600" />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-green-700">Healthy</span>
                       </div>
                       <div className="p-2 rounded-lg bg-blue-50 flex items-center gap-1.5 justify-center">
                          <Award className="h-3 w-3 text-blue-600" />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-blue-700">Trained</span>
                       </div>
                       <div className="p-2 rounded-lg bg-orange-50 flex items-center gap-1.5 justify-center">
                          <ShieldCheck className="h-3 w-3 text-orange-600" />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-orange-700">Verified</span>
                       </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-5 md:p-8 pt-0">
                {isEditingPet ? (
                  <div className="flex w-full gap-2">
                    <Button type="submit" disabled={isSubmittingPet} className="flex-1 h-10 rounded-lg bg-primary text-sm font-bold shadow-md">
                      {isSubmittingPet ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Save className="mr-2 h-3.5 w-3.5" />}
                      Save Identity
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setIsEditingPet(false); resetPetForm(petData); }} className="px-3 h-10 rounded-lg font-bold border-slate-200 text-xs">
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button type="button" variant="outline" className="w-full h-10 rounded-lg font-bold text-slate-600 border-slate-200 hover:bg-slate-50 text-xs" onClick={() => { resetPetForm(petData); setIsEditingPet(true); }}>
                    <Edit3 className="mr-2 h-3.5 w-3.5 text-primary" /> 
                    Edit Digital Identity
                  </Button>
                )}
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Parent Account Card */}
        <div className="lg:col-span-5 space-y-6">
           <Card className="rounded-xl border-none shadow-sm bg-white overflow-hidden">
              <form onSubmit={handleOwnerSubmit(onOwnerSubmit)}>
                <CardHeader className="p-5 pb-2">
                   <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold font-headline text-slate-900">Parent Account</h3>
                      {!isEditingOwner && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-slate-50" onClick={() => { resetOwnerForm(ownerData); setIsEditingOwner(true); }}>
                          <Edit3 className="h-3.5 w-3.5 text-slate-400" />
                        </Button>
                      )}
                   </div>
                   
                   <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-2 ring-accent/5">
                          <AvatarImage src={ownerData.avatar} className="object-cover" />
                          <AvatarFallback className="bg-slate-50"><User className="h-7 w-7 text-slate-300" /></AvatarFallback>
                        </Avatar>
                        <input type="file" ref={ownerAvatarInputRef} onChange={handleOwnerAvatarUpload} className="hidden" accept="image/*" disabled={isUploadingOwnerAvatar} />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-white shadow-sm border-none"
                          onClick={() => ownerAvatarInputRef.current?.click()}
                          disabled={isUploadingOwnerAvatar}
                        >
                          {isUploadingOwnerAvatar ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Upload className="h-2.5 w-2.5" />}
                        </Button>
                      </div>
                      <div className="flex-1 space-y-0.5">
                         {isEditingOwner ? (
                            <Input {...registerOwner("name")} className="font-bold text-base h-auto py-0.5 bg-slate-50 border-none px-2" />
                         ) : (
                           <h4 className="text-base font-bold text-slate-800">{ownerData.name}</h4>
                         )}
                         <p className="text-[10px] font-medium text-primary">Chief Pet Parent</p>
                      </div>
                   </div>
                </CardHeader>
                
                <CardContent className="p-5 space-y-3">
                   <div className="space-y-2">
                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50/50 border border-slate-100/50">
                         <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                            <Mail className="h-3.5 w-3.5" />
                         </div>
                         <div className="overflow-hidden">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Email Address</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{ownerData.email}</p>
                         </div>
                      </div>

                      <div className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50/50 border border-slate-100/50">
                         <div className="h-7 w-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary shrink-0">
                            <Phone className="h-3.5 w-3.5" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Mobile Number</p>
                            {isEditingOwner ? (
                              <Input {...registerOwner("phone")} className="h-auto py-0 px-0 bg-transparent border-none text-[11px] font-bold text-slate-700 focus-visible:ring-0" placeholder="Add phone..." />
                            ) : (
                              <p className="text-[11px] font-bold text-slate-700">{ownerData.phone || 'Not set'}</p>
                            )}
                         </div>
                      </div>
                   </div>
                </CardContent>

                {isEditingOwner && (
                  <CardFooter className="p-5 pt-0 flex gap-2">
                    <Button type="submit" disabled={isSubmittingOwner} className="flex-1 h-9 rounded-lg bg-slate-900 font-bold text-[11px]">
                       {isSubmittingOwner ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save Changes"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsEditingOwner(false)} className="h-9 rounded-lg text-[11px]">
                       Cancel
                    </Button>
                  </CardFooter>
                )}
              </form>
           </Card>

           <div className="p-5 rounded-xl bg-accent text-white shadow-md relative overflow-hidden group">
              <div className="relative z-10 space-y-2">
                 <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-white" />
                    <h4 className="text-base font-bold font-headline">Privacy First 🔒</h4>
                 </div>
                 <p className="text-[10px] opacity-70 leading-relaxed font-medium">
                   Your health data and contact details are encrypted and only shared with verified providers.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
