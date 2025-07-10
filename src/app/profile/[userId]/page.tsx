
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PawPrint, User, Mail, Phone, Home, Loader2, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useLoading } from "@/contexts/loading-context";

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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { hideLoading, showLoading } = useLoading();
  const userId = params.userId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);

  useEffect(() => {
    // Hide the global page loader that was triggered when navigating here.
    hideLoading();
  }, [hideLoading]);
  
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
      } else {
        toast({ variant: "destructive", title: "Error", description: "This user profile does not exist." });
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
  }, [userId, router, toast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);
  
  const handleGoBack = () => {
    // Check if there's a page to go back to in the history
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback to a default page if no history is available
      router.push('/');
    }
  };

  if (isLoading) {
    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-6 w-32" />
            </header>
            <main className="flex-1 overflow-y-auto p-4 space-y-8">
                 <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            </main>
        </div>
    )
  }
  
  if (!ownerData) {
      return (
           <div className="flex flex-col h-screen bg-background">
             <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
                 <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleGoBack}>
                    <ArrowLeft className="h-5 w-5" />
                 </Button>
                 <h1 className="font-semibold text-lg">Profile Not Found</h1>
             </header>
            <main className="flex-1 overflow-y-auto p-4">
                <p>Could not load the requested user profile. It may have been deleted.</p>
            </main>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
         <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
         </Button>
         <h1 className="font-semibold text-lg truncate">{`${ownerData.name}'s Profile`}</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-8">
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
      </main>
    </div>
  );
}
