
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, User, Mail, Phone, Home, ArrowLeft, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

interface PetData {
  name: string;
  breed: string;
  age: string;
  bio: string;
  avatar: string;
  dataAiHint: string;
}

interface OwnerData {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  dataAiHint: string;
}

interface UserProfilePageProps {
    setPageTitle?: (title: string) => void;
}

export default function UserProfilePage({ setPageTitle }: UserProfilePageProps) {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = params.userId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  const [headerTitle, setHeaderTitle] = useState<string>("Loading Profile...");

  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", userId);
      const petDocRef = doc(db, "users", userId, "pets", "main-pet");

      const [userDocSnap, petDocSnap] = await Promise.all([
        getDoc(userDocRef),
        getDoc(petDocRef),
      ]);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as OwnerData;
        setOwnerData(data);
        const title = data.name ? `${data.name}'s Profile` : "User Profile";
        setHeaderTitle(title);
        if(setPageTitle) setPageTitle(title);
      } else {
        toast({ variant: "destructive", title: "Error", description: "This user profile does not exist." });
        setHeaderTitle("Profile Not Found");
        if(setPageTitle) setPageTitle("Profile Not Found");
        router.push('/'); // Redirect if user not found
        return;
      }
      
      if (petDocSnap.exists()) {
        setPetData(petDocSnap.data() as PetData);
      } else {
        // It's possible a user exists without a pet, handle gracefully
        setPetData(null); 
      }

    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast({ variant: "destructive", title: "Error", description: `Could not fetch profile data.` });
    } finally {
      setIsLoading(false);
    }
  }, [userId, router, toast, setPageTitle]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  
  useEffect(() => {
      if(setPageTitle) {
          setPageTitle(headerTitle);
      }
  }, [headerTitle, setPageTitle]);
  
  const isOwnProfile = user?.uid === userId;

  if (isLoading) {
    return (
        <div className="space-y-8">
            <div className="text-center">
                 <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 mt-8">
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-24 w-full" /></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
            </div>
        </div>
    )
  }
  
  if (!ownerData) {
      return (
          <div className="space-y-4">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
            <p>Could not load the requested user profile. It may have been deleted.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8">
       {!isOwnProfile && (
            <Button variant="outline" onClick={() => router.back()} className="md:hidden">
              <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
            </Button>
          )}
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {petData ? (
            <Card className="shadow-lg">
                <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={petData.avatar} alt={petData.name} data-ai-hint={petData.dataAiHint} />
                    <AvatarFallback><PawPrint className="h-10 w-10" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="font-headline text-2xl sm:text-3xl">{petData.name}</CardTitle>
                        <p className="text-muted-foreground">{petData.breed}</p>
                    </div>
                </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Age</span>
                        <p className="text-base sm:text-lg">{petData.age}</p>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-muted-foreground">Bio</span>
                        <p className="text-base italic text-foreground">{petData.bio || "No bio set."}</p>
                    </div>
                </CardContent>
            </Card>
        ) : (
          <Card className="shadow-lg flex items-center justify-center p-8">
            <p className="text-muted-foreground">{ownerData.name} has not added a pet profile yet.</p>
          </Card>
        )}

        <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-accent">
                    <AvatarImage src={ownerData.avatar} alt={ownerData.name} data-ai-hint={ownerData.dataAiHint} />
                    <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="font-headline text-2xl sm:text-3xl">{ownerData.name}</CardTitle>
                        <p className="text-muted-foreground">Pet Owner</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <p className="truncate text-base sm:text-lg">{ownerData.email}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="text-base sm:text-lg">{ownerData.phone || "Not set"}</p>
                </div>
                <div className="flex items-start gap-2">
                    <Home className="h-5 w-5 text-muted-foreground mt-1" />
                    <p className="text-base sm:text-lg">{ownerData.address || "Not set"}</p>
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
