
"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, collectionGroup, getDocs, doc, setDoc, serverTimestamp, query, where, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Loader2, Check, Bell, X } from "lucide-react";

// Define a type for the pet data we'll fetch
interface Pet {
  id: string; // Composite ID: ownerId-petId
  petId: string; // The pet's document ID
  ownerId: string; // The owner's UID
  name: string;
  breed: string;
  image: string; // URL for the pet's image
  dataAiHint: string;
}

interface MatchRequest {
    id: string;
    requesterId: string;
    requesterEmail: string;
    targetPetName: string;
    status: 'pending' | 'accepted' | 'declined';
}


export default function MatchPetPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [matchRequests, setMatchRequests] = useState<Record<string, boolean>>({}); // key: composite petId, value: true if requested
  const [submitting, setSubmitting] = useState<string | null>(null); // Stores the composite ID of the pet being requested
  
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isUpdatingRequest, setIsUpdatingRequest] = useState<string | null>(null);


  const fetchPets = useCallback(async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    setLoading(true);
    try {
      // This is a collection group query. It requires a specific index in Firestore.
      const petsQuery = collectionGroup(db, "pets");
      const querySnapshot = await getDocs(petsQuery);

      const petsList: Pet[] = querySnapshot.docs.map((petDoc) => {
        const data = petDoc.data();
        const pathParts = petDoc.ref.path.split('/');
        const ownerId = pathParts[1];
        const petId = petDoc.id;
        
        return {
          id: `${ownerId}-${petId}`, // Create a unique composite ID
          petId: petId,
          ownerId: ownerId,
          name: data.name || "Unnamed Pet",
          breed: data.breed || "Unknown Breed",
          image: data.avatar || "https://placehold.co/300x300.png",
          dataAiHint: data.dataAiHint || "pet portrait",
        };
      });
      
      const displayPets = petsList.filter(pet => pet.ownerId !== user.uid);
      setPets(displayPets);

    } catch (error) {
      console.error("Error fetching pets:", error);
      toast({
        variant: "destructive",
        title: "Failed to load pets",
        description: "This may require a Firestore index. Check the browser console for a link to create it.",
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

  // Listen for incoming match requests
  useEffect(() => {
    if (!user) return;

    const requestsQuery = query(
      collection(db, "matchRequests"),
      where("targetOwnerId", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as MatchRequest));
      setIncomingRequests(requests);
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
            targetPetId: targetPet.petId,
            targetPetName: targetPet.name,
            status: "pending",
            createdAt: serverTimestamp(),
        });
        
        setMatchRequests(prev => ({ ...prev, [targetPet.id]: true }));
        
        toast({ title: "Match Request Sent!", description: `Your request to match with ${targetPet.name} has been sent.` });

    } catch (error) {
        console.error("Error sending match request:", error);
        toast({ variant: "destructive", title: "Request Failed", description: "Could not send the match request. Please try again." });
    } finally {
        setSubmitting(null);
    }
  };

  const handleRequestResponse = async (requestId: string, status: 'accepted' | 'declined') => {
    setIsUpdatingRequest(requestId);
    try {
        const requestRef = doc(db, "matchRequests", requestId);
        await updateDoc(requestRef, { status: status });
        
        toast({
            title: `Request ${status}`,
            description: `You have ${status} the match request.`
        });
        // The real-time listener will automatically remove it from the list.
    } catch (error) {
        console.error(`Error updating request ${requestId}:`, error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "Could not update the request. Please try again."
        });
    } finally {
        setIsUpdatingRequest(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Match Your Pet"
        description="Find the perfect pet companion for playdates and celebrations. Browse available pets and send a match request."
      >
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {incomingRequests.length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0">
                  {incomingRequests.length}
                </Badge>
              )}
              <span className="sr-only">View match requests</span>
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
                    <div key={req.id} className="grid grid-cols-[1fr_auto] items-center gap-4 rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium truncate">From: {req.requesterEmail}</p>
                        <p className="text-sm text-muted-foreground">For: {req.targetPetName}</p>
                      </div>
                      <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2"
                            onClick={() => handleRequestResponse(req.id, 'accepted')}
                            disabled={isUpdatingRequest === req.id}
                          >
                             {isUpdatingRequest === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4 text-green-500" />}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-8 px-2"
                            onClick={() => handleRequestResponse(req.id, 'declined')}
                             disabled={isUpdatingRequest === req.id}
                           >
                            {isUpdatingRequest === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <X className="h-4 w-4"/>}
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
      </PageHeader>
      
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" disabled>
          <Search className="mr-2 h-4 w-4" /> Filter Pets (Coming Soon)
        </Button>
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
      ) : pets.length === 0 ? (
        <Card className="text-center py-12">
            <CardContent>
                <p className="text-muted-foreground">No other pets are available for matching right now.</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later or ensure other users have created profiles!</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
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
                    disabled={submitting === pet.id || matchRequests[pet.id]}
                >
                    {submitting === pet.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : matchRequests[pet.id] ? (
                        <Check className="mr-2 h-4 w-4" />
                    ) : (
                        <Heart className="mr-2 h-4 w-4" />
                    )}
                    {submitting === pet.id ? "Sending..." : matchRequests[pet.id] ? "Request Sent" : "Request Match"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

    

    