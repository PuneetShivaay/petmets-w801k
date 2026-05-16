"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, onSnapshot, query, collection, where, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PawPrint, User, Mail, Phone, Home, Loader2, ArrowLeft, Check, X, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useLoading } from "@/contexts/loading-context";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

interface PetData {
  name: string;
  breed: string;
  age: string;
  gender: string;
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

interface MatchRequest {
  id: string;
  requesterId: string;
  requesterEmail: string;
  targetOwnerId: string;
  targetPetName: string;
  status: 'pending' | 'accepted' | 'declined';
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { hideLoading } = useLoading();
  const userId = params.userId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [petData, setPetData] = useState<PetData | null>(null);
  const [ownerData, setOwnerData] = useState<OwnerData | null>(null);
  
  // Match Request State
  const [incomingRequest, setIncomingRequest] = useState<MatchRequest | null>(null);
  const [isUpdatingRequest, setIsUpdatingRequest] = useState(false);

  useEffect(() => {
    hideLoading();
  }, [hideLoading]);
  
  const fetchProfileData = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const userDocRef = doc(db, "users", userId);
      const petDocRef = doc(db, "pets", userId);

      const [userDocSnap, petDocSnap] = await Promise.all([
        getDoc(userDocRef),
        getDoc(petDocRef),
      ]);
      
      if (userDocSnap.exists()) {
        const data = userDocSnap.data() as OwnerData;
        setOwnerData(data);
      } else {
        toast({ variant: "destructive", title: "Error", description: "This user profile does not exist." });
        router.push('/'); 
        return;
      }
      
      if (petDocSnap.exists()) {
        setPetData(petDocSnap.data() as PetData);
      } else {
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

  // Subscribe to incoming match request from this user
  useEffect(() => {
    if (!user || !userId) return;

    const q = query(
      collection(db, "matchRequests"),
      where("requesterId", "==", userId),
      where("targetOwnerId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setIncomingRequest({ id: doc.id, ...doc.data() } as MatchRequest);
      } else {
        setIncomingRequest(null);
      }
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'matchRequests',
        operation: 'list'
      }));
    });

    return () => unsubscribe();
  }, [user, userId]);
  
  const handleRequestResponse = async (status: 'accepted' | 'declined') => {
    if (!user || !incomingRequest) return;
    setIsUpdatingRequest(true);
    
    const batch = writeBatch(db);
    const requestRef = doc(db, "matchRequests", incomingRequest.id);
    const updateData = { status: status };
    batch.update(requestRef, updateData);

    if (status === 'accepted') {
        const chatId = [user.uid, incomingRequest.requesterId].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);
        batch.set(chatRef, {
            participants: [user.uid, incomingRequest.requesterId],
            participantEmails: [user.email, incomingRequest.requesterEmail],
            createdAt: serverTimestamp(),
            lastMessage: 'Chat started!',
            lastMessageTimestamp: serverTimestamp(),
        }, { merge: true });
    }
    
    batch.commit()
      .then(() => {
        toast({
            title: `Request ${status}`,
            description: `You have ${status} the match request from ${ownerData?.name}.`
        });
        if (status === 'accepted') {
          router.push('/chats');
        }
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: requestRef.path,
          operation: 'update',
          requestResourceData: updateData,
        }));
      })
      .finally(() => {
        setIsUpdatingRequest(false);
      });
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      router.back();
    } else {
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
    <div className="flex flex-col h-screen bg-background pb-20 sm:pb-0">
       <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
         <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
         </Button>
         <h1 className="font-semibold text-lg truncate">{`${ownerData.name}'s Profile`}</h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
        {/* Pending Request Alert */}
        {incomingRequest && (
          <Card className="bg-primary/5 border-primary/20 overflow-hidden shadow-md">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold">Match Request Pending</p>
                  <p className="text-sm text-muted-foreground">{ownerData.name} wants to match with your pet.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleRequestResponse('accepted')}
                  disabled={isUpdatingRequest}
                >
                  {isUpdatingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1" />}
                  Accept
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="flex-1 sm:flex-none"
                  onClick={() => handleRequestResponse('declined')}
                  disabled={isUpdatingRequest}
                >
                  {isUpdatingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-1" />}
                  Decline
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {petData ? (
                <Card className="shadow-lg">
                    <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarImage src={petData.avatar || "/images/logo.png"} alt={petData.name} data-ai-hint={petData.dataAiHint} />
                        <AvatarFallback><PawPrint className="h-10 w-10" /></AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="font-headline text-2xl sm:text-3xl">{petData.name}</CardTitle>
                            <p className="text-muted-foreground">{petData.breed}</p>
                        </div>
                    </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm font-medium text-muted-foreground">Age</span>
                                <p className="text-base sm:text-lg">{petData.age}</p>
                            </div>
                             <div>
                                <span className="text-sm font-medium text-muted-foreground">Gender</span>
                                <p className="text-base sm:text-lg">{petData.gender}</p>
                            </div>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-muted-foreground">Bio</span>
                            <p className="text-base italic text-foreground leading-relaxed">
                              {petData.bio || "No bio set."}
                            </p>
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
                        <AvatarImage src={ownerData.avatar || "/images/logo.png"} alt={ownerData.name} data-ai-hint={ownerData.dataAiHint} />
                        <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="font-headline text-2xl sm:text-3xl">{ownerData.name}</CardTitle>
                            <p className="text-muted-foreground">Pet Owner</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <p className="truncate text-base sm:text-lg">{ownerData.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <p className="text-base sm:text-lg">{ownerData.phone || "Not set"}</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <Home className="h-5 w-5 text-muted-foreground mt-1" />
                        <p className="text-base sm:text-lg">{ownerData.address || "Not set"}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </main>

      {/* Mobile Sticky Footer (Only if request exists) */}
      {incomingRequest && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t p-4 flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-20">
           <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => handleRequestResponse('accepted')}
            disabled={isUpdatingRequest}
          >
            {isUpdatingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Accept
          </Button>
          <Button 
            variant="destructive" 
            className="flex-1"
            onClick={() => handleRequestResponse('declined')}
            disabled={isUpdatingRequest}
          >
            {isUpdatingRequest ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4 mr-2" />}
            Decline
          </Button>
        </div>
      )}
    </div>
  );
}