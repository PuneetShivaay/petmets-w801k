
"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, doc, setDoc, serverTimestamp, query, where, onSnapshot, writeBatch, getDoc, collectionGroup } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Search, Loader2, Check, Bell, X, Clock, Info } from "lucide-react";

interface Pet {
  id: string; 
  ownerId: string;
  name: string;
  breed: string;
  image: string;
  dataAiHint: string;
}

interface MatchRequest {
    id: string;
    requesterId: string;
    requesterName: string;
    requesterEmail: string;
    targetPetName: string;
    status: 'pending' | 'accepted' | 'declined';
}

export default function MatchPetPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [displayPets, setDisplayPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isUpdatingRequest, setIsUpdatingRequest] = useState<string | null>(null);
  
  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set());
  const [pendingRequestPetIds, setPendingRequestPetIds] = useState<Set<string>>(new Set());
  
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPets = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      // Using collectionGroup("pets") to find all pet documents across any path.
      // This is a robust way to handle both top-level and sub-collection pet data.
      const petsCol = collectionGroup(db, "pets");
      const querySnapshot = await getDocs(petsCol);

      const petsList: Pet[] = querySnapshot.docs
        .map((petDoc) => {
            const data = petDoc.data();
            // ownerId is either doc.id (for top-level) or data.userId (if stored explicitly)
            // or we extract it from the path (e.g. /users/UID/pets/main-pet)
            let ownerId = data.userId || petDoc.id;
            
            // If the document path indicates it's a subcollection of 'users', extract the UID
            if (petDoc.ref.path.includes('users/')) {
                const parts = petDoc.ref.path.split('/');
                const usersIndex = parts.indexOf('users');
                if (usersIndex !== -1 && parts[usersIndex + 1]) {
                    ownerId = parts[usersIndex + 1];
                }
            }

            return {
              id: petDoc.id,
              ownerId: ownerId,
              name: data.name || "Unnamed Pet",
              breed: data.breed || "Unknown Breed",
              image: data.avatar || "https://placehold.co/300x300.png",
              dataAiHint: data.dataAiHint || "pet portrait",
            };
        })
        // Filter out current user's pet so you don't match with yourself
        .filter(pet => pet.ownerId !== user.uid);
      
      setAllPets(petsList);

    } catch (error) {
      console.error("Error fetching pets:", error);
      toast({
        variant: "destructive",
        title: "Failed to load pets",
        description: "Could not retrieve pets for matching.",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchPets();
    }
  }, [isAuthLoading, fetchPets]);
  
  useEffect(() => {
      if (!user) return;
      
      const chatsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', user.uid)
      );

      const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
          const newMatchedIds = new Set<string>();
          snapshot.forEach(doc => {
              const chatData = doc.data();
              chatData.participants.forEach((participantId: string) => {
                  if (participantId !== user.uid) {
                      newMatchedIds.add(participantId);
                  }
              });
          });
          setMatchedUserIds(newMatchedIds);
      });

      return () => unsubscribe();
  }, [user]);

  useEffect(() => {
      // Filtering happens on client side to avoid requiring complex composite indices
      const filteredByMatch = allPets.filter(pet => !matchedUserIds.has(pet.ownerId));
      
      if (searchTerm.trim() === "") {
        setDisplayPets(filteredByMatch);
      } else {
        const lowercasedTerm = searchTerm.toLowerCase();
        const filteredBySearch = filteredByMatch.filter(pet => 
          pet.name.toLowerCase().includes(lowercasedTerm) || 
          pet.breed.toLowerCase().includes(lowercasedTerm)
        );
        setDisplayPets(filteredBySearch);
      }
  }, [allPets, matchedUserIds, searchTerm]);

  useEffect(() => {
    if (!user) return;

    const requestsQuery = query(
      collection(db, "matchRequests"),
      where("targetOwnerId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(requestsQuery, async (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const enhancedRequests = await Promise.all(
        requestsData.map(async (req) => {
          const userDoc = await getDoc(doc(db, "users", req.requesterId));
          const requesterName = userDoc.exists() ? userDoc.data().name : req.requesterEmail;
          return { ...req, requesterName } as MatchRequest;
        })
      );
      
      setIncomingRequests(enhancedRequests);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const sentRequestsQuery = query(
      collection(db, "matchRequests"),
      where("requesterId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(sentRequestsQuery, (snapshot) => {
        const newPendingIds = new Set<string>();
        snapshot.forEach(doc => {
            const data = doc.data();
            newPendingIds.add(data.targetOwnerId);
        });
        setPendingRequestPetIds(newPendingIds);
    });

    return () => unsubscribe();
  }, [user]);

  const handleMatchRequest = async (targetPet: Pet) => {
    if (!user) {
        toast({ variant: "destructive", title: "Please login", description: "You must be logged in to request a match." });
        return;
    }
    
    setSubmitting(targetPet.id);

    try {
        const matchRequestRef = doc(collection(db, "matchRequests"));

        await setDoc(matchRequestRef, {
            requesterId: user.uid,
            requesterEmail: user.email,
            targetOwnerId: targetPet.ownerId,
            targetPetId: targetPet.id,
            targetPetName: targetPet.name,
            status: "pending",
            createdAt: serverTimestamp(),
        });
        
        toast({ title: "Match Request Sent!", description: `Your request to match with ${targetPet.name} has been sent.` });

    } catch (error) {
        console.error("Error sending match request:", error);
        toast({ variant: "destructive", title: "Request Failed", description: "Could not send the match request. Please try again." });
    } finally {
        setSubmitting(null);
    }
  };

  const handleRequestResponse = async (request: MatchRequest, status: 'accepted' | 'declined') => {
    if (!user) return;
    setIsUpdatingRequest(request.id);
    try {
        const batch = writeBatch(db);
        const requestRef = doc(db, "matchRequests", request.id);
        
        batch.update(requestRef, { status: status });

        if (status === 'accepted') {
            const chatId = [user.uid, request.requesterId].sort().join('_');
            const chatRef = doc(db, 'chats', chatId);

            batch.set(chatRef, {
                participants: [user.uid, request.requesterId],
                participantEmails: [user.email, request.requesterEmail],
                createdAt: serverTimestamp(),
                lastMessage: 'Chat started!',
                lastMessageTimestamp: serverTimestamp(),
            }, { merge: true });
        }
        
        await batch.commit();

        toast({
            title: `Request ${status}`,
            description: `You have ${status} the match request.`
        });

    } catch (error) {
        console.error(`Error updating request ${request.id}:`, error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the request. Please try again."
        });
    } finally {
        setIsUpdatingRequest(null);
    }
  }
  
  const getButtonState = (pet: Pet) => {
    if (submitting === pet.id) {
        return { text: "Sending...", icon: Loader2, disabled: true, className: "animate-spin" };
    }
    if (pendingRequestPetIds.has(pet.ownerId)) {
        return { text: "Request Pending", icon: Clock, disabled: true, className: "" };
    }
    return { text: "Request Match", icon: Heart, disabled: false, className: "" };
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">Find the perfect pet companion for playdates and celebrations. Browse available pets and send a match request.</p>
      
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            type="search"
            placeholder="Filter by pet name or breed..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative shrink-0">
              <Bell className="mr-2 h-5 w-5" />
              <span>Notifications</span>
              {incomingRequests.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center p-0 text-xs">
                  {incomingRequests.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Incoming Requests</h4>
                <p className="text-sm text-muted-foreground">
                  Accept or decline requests from other pet owners.
                </p>
              </div>
              <div className="grid gap-2">
                {incomingRequests.length > 0 ? (
                  incomingRequests.map(req => (
                    <div key={req.id} className="rounded-md border p-3 flex flex-col gap-2">
                      <div>
                        <p className="text-sm font-medium truncate">From: {req.requesterName}</p>
                        <p className="text-sm text-muted-foreground">For: {req.targetPetName}</p>
                      </div>
                      <div className="flex gap-2 justify-end">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 flex-1"
                            onClick={() => handleRequestResponse(req, 'accepted')}
                            disabled={isUpdatingRequest === req.id}
                          >
                             {isUpdatingRequest === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4 text-green-500" />}
                             <span className="ml-1">Accept</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-8 px-2 flex-1"
                            onClick={() => handleRequestResponse(req, 'declined')}
                             disabled={isUpdatingRequest === req.id}
                           >
                            {isUpdatingRequest === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4"/>}
                            <span className="ml-1">Decline</span>
                          </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No new requests.</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-lg shadow-lg">
                <Skeleton className="h-60 w-full" />
                <CardHeader><Skeleton className="h-7 w-1/2" /></CardHeader>
                <CardContent>
                    <Skeleton className="h-5 w-1/3 mb-4" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
          ))}
        </div>
      ) : displayPets.length === 0 ? (
        <Card className="text-center py-12 px-4">
            <CardContent>
                <Info className="mx-auto h-12 w-12 text-muted-foreground opacity-20 mb-4" />
                <p className="text-muted-foreground">No pets found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Pets you've already matched with or your own pet are not shown here. 
                  Try clearing your search filter if you have one applied.
                </p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayPets.map((pet) => {
            const buttonState = getButtonState(pet);
            return (
                <Card key={pet.id} className="overflow-hidden rounded-lg shadow-lg">
                <div className="relative h-60 w-full">
                    <Image 
                    src={pet.image} 
                    alt={pet.name} 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={pet.dataAiHint}
                    />
                </div>
                <CardHeader>
                    <CardTitle className="font-headline text-xl sm:text-2xl">{pet.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{pet.breed}</p>
                    <Button 
                        className="mt-4 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={() => handleMatchRequest(pet)}
                        disabled={buttonState.disabled}
                    >
                        <buttonState.icon className={`mr-2 h-4 w-4 ${buttonState.className}`} />
                        {buttonState.text}
                    </Button>
                </CardContent>
                </Card>
            );
        })}
        </div>
      )}
    </div>
  );
}
