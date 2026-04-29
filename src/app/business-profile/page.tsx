
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Edit3, Save, XCircle, Loader2, Upload, Star, MapPin, Phone, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

const providerSchema = z.object({
  name: z.string().min(2, "Business name is required.").max(50),
  service: z.enum(["Walking", "Grooming", "Training", "Boarding", "Photography"]),
  bio: z.string().min(10, "Please provide a short description of your services.").max(500),
  location: z.string().min(2, "Location is required."),
});
type ProviderFormData = z.infer<typeof providerSchema>;

export default function BusinessProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [providerData, setProviderData] = useState<any>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ProviderFormData>({
    resolver: zodResolver(providerSchema),
  });

  const fetchProviderData = useCallback(async () => {
    if (!user) return;
    try {
      const providerDocRef = doc(db, "service_providers", user.uid);
      const docSnap = await getDoc(providerDocRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProviderData(data);
        reset(data);
      } else {
        setProviderData(null);
      }
    } catch (error) {
      console.error("Error fetching provider data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, reset]);

  useEffect(() => {
    fetchProviderData();
  }, [fetchProviderData]);

  const onSubmit: SubmitHandler<ProviderFormData> = async (data) => {
    if (!user) return;
    setIsSubmitting(true);
    
    const providerDocRef = doc(db, "service_providers", user.uid);
    const dataToSave = {
      ...data,
      userId: user.uid,
      email: user.email,
      // Note: In a real app, we'd fetch the latest phone from the User doc, but for MVP we use user object
      updatedAt: serverTimestamp(),
      image: providerData?.image || "https://placehold.co/600x400.png",
      rating: providerData?.rating || 5.0,
    };
    
    setDoc(providerDocRef, dataToSave, { merge: true })
      .then(() => {
        setProviderData(dataToSave);
        toast({ title: "Success", description: "Business details updated." });
        setIsEditing(false);
      })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: providerDocRef.path,
          operation: 'update',
          requestResourceData: dataToSave,
        }));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.[0]) return;
    const file = event.target.files[0];
    
    setIsUploading(true);
    const filePath = `service_providers/${user.uid}/profile_${Date.now()}.jpg`;
    const avatarRef = storageRef(storage, filePath);
    
    try {
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const providerDocRef = doc(db, "service_providers", user.uid);
      setDoc(providerDocRef, { image: downloadURL }, { merge: true })
        .then(() => {
          setProviderData((prev: any) => ({ ...prev, image: downloadURL }));
          toast({ title: 'Success', description: 'Business photo updated.' });
        })
        .catch((err) => {
           errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: providerDocRef.path,
            operation: 'update',
            requestResourceData: { image: downloadURL },
          }));
        });
    } catch (error: any) {
      console.error("Avatar upload failed:", error);
      const isPermissionError = error.code === 'storage/unauthorized';
      
      toast({ 
        variant: 'destructive', 
        title: isPermissionError ? 'Permission Denied' : 'Upload Failed', 
        description: isPermissionError 
          ? 'You do not have permission to upload this file.' 
          : error.message || 'Could not upload image.' 
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-64 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">Manage Your Business</h2>
        {!isEditing && providerData && (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      {!providerData && !isEditing ? (
        <Card className="text-center py-12">
          <CardHeader>
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">You don't have a public listing yet</CardTitle>
            <CardDescription>Register your business to start appearing in search results and receiving bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setIsEditing(true)}>Set Up My Business Profile</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 shadow-lg h-fit">
            <CardHeader className="text-center">
              <div className="relative mx-auto w-32 h-32 mb-4 group">
                <Avatar className="w-full h-full border-4 border-primary">
                  <AvatarImage src={providerData?.image} />
                  <AvatarFallback><Briefcase className="h-12 w-12" /></AvatarFallback>
                </Avatar>
                <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
              </div>
              <CardTitle>{providerData?.name || "Business Name"}</CardTitle>
              <Badge className="mt-2" variant="secondary">{providerData?.service || "Select Service"}</Badge>
              <div className="flex items-center justify-center gap-1 mt-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{providerData?.rating?.toFixed(1) || "5.0"}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user?.email}</span>
                </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)}>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>This information is visible to all pet owners.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="name">Business Name</Label>
                      <Input id="name" {...register("name")} />
                      {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="service">Service Type</Label>
                        <Select onValueChange={(v) => setValue("service", v as any)} defaultValue={providerData?.service}>
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
                        <Input id="location" {...register("location")} />
                        {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="bio">Service Description</Label>
                      <Textarea id="bio" {...register("bio")} rows={5} placeholder="Describe your experience..." />
                      {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <span>{providerData?.location}</span>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        About Our Services
                      </h4>
                      <p className="text-muted-foreground italic leading-relaxed whitespace-pre-wrap">
                        "{providerData?.bio}"
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-6">
                {isEditing ? (
                  <>
                    <Button type="button" variant="ghost" onClick={() => { setIsEditing(false); reset(providerData); }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Profile
                    </Button>
                  </>
                ) : null}
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
