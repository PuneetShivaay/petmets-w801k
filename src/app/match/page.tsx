"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  collection, getDocs, doc, setDoc, serverTimestamp, query, where, onSnapshot, writeBatch, getDoc,
  orderBy, limit, startAfter, documentId,
  type QueryConstraint, type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, Search, Loader2, Check, Bell, X, Clock, Info, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonTone, layout, surfaceVariants } from "@/theme/variants";

const PET_GRID = layout.cardGrid;
/** Pets fetched per page (divisible by 2/4/5 grid columns → full rows). */
const PETS_PAGE_SIZE = 20;

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
    targetOwnerId: string;
    targetPetName: string;
    status: 'pending' | 'accepted' | 'declined';
}

export default function MatchPetPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [displayPets, setDisplayPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  // Pagination cursor kept in a ref so fetchPets always reads the latest value.
  const lastPetDocRef = useRef<QueryDocumentSnapshot | null>(null);
  const [hasMorePets, setHasMorePets] = useState(false);
  const [submitting, setSubmitting] = useState<string | null>(null);
  
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isUpdatingRequest, setIsUpdatingRequest] = useState<string | null>(null);
  
  const [matchedUserIds, setMatchedUserIds] = useState<Set<string>>(new Set());
  const [pendingRequestPetIds, setPendingRequestPetIds] = useState<Set<string>>(new Set());
  
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPets = useCallback(async (loadMore = false) => {
    if (!user) {
        setLoading(false);
        return;
    }
    if (loadMore) setLoadingMore(true); else setLoading(true);
    try {
      // Paged by document ID (always indexed, stable order) instead of reading the whole collection.
      const constraints: QueryConstraint[] = [orderBy(documentId()), limit(PETS_PAGE_SIZE)];
      if (loadMore && lastPetDocRef.current) constraints.splice(1, 0, startAfter(lastPetDocRef.current));
      const querySnapshot = await getDocs(query(collection(db, "pets"), ...constraints));

      const petsList: Pet[] = querySnapshot.docs
        .map((petDoc) => {
            const data = petDoc.data();
            const ownerId = petDoc.id;

            return {
              id: petDoc.id,
              ownerId: ownerId,
              name: data.name || "Unnamed Pet",
              breed: data.breed || "Unknown Breed",
              image: data.avatar || "/images/logo.png",
              dataAiHint: data.dataAiHint || "pet portrait",
            };
        })
        .filter(pet => pet.ownerId !== user.uid);
      
      setAllPets(prev => (loadMore ? [...prev, ...petsList] : petsList));
      lastPetDocRef.current = querySnapshot.docs[querySnapshot.docs.length - 1] ?? null;
      setHasMorePets(querySnapshot.docs.length === PETS_PAGE_SIZE);

    } catch (error) {
      console.error("Error fetching pets:", error);
      toast({
        variant: "destructive",
        title: "Failed to load pets",
        description: "Could not retrieve pets for matching.",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
      }, (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'chats',
          operation: 'list'
        }));
      });

      return () => unsubscribe();
  }, [user]);

  useEffect(() => {
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
        requestsData.map(async (req: any) => {
          const userDoc = await getDoc(doc(db, "users", req.requesterId));
          const requesterName = userDoc.exists() ? userDoc.data().name : req.requesterEmail;
          return { ...req, requesterName } as MatchRequest;
        })
      );
      
      setIncomingRequests(enhancedRequests);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'matchRequests',
        operation: 'list'
      }));
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
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'matchRequests',
        operation: 'list'
      }));
    });

    return () => unsubscribe();
  }, [user]);

  const handleMatchRequest = async (targetPet: Pet) => {
    if (!user) {
        toast({ variant: "destructive", title: "Please login", description: "You must be logged in to request a match." });
        return;
    }
    
    setSubmitting(targetPet.id);
    const matchRequestRef = doc(collection(db, "matchRequests"));
    const data = {
        requesterId: user.uid,
        requesterEmail: user.email,
        targetOwnerId: targetPet.ownerId,
        targetPetId: targetPet.id,
        targetPetName: targetPet.name,
        status: "pending",
        createdAt: serverTimestamp(),
    };

    setDoc(matchRequestRef, data)
      .then(() => {
        toast({ title: "Match Request Sent!", description: `Your request to match with ${targetPet.name} has been sent.` });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: matchRequestRef.path,
          operation: 'create',
          requestResourceData: data,
        }));
      })
      .finally(() => {
        setSubmitting(null);
      });
  };

  const handleRequestResponse = async (request: MatchRequest, status: 'accepted' | 'declined') => {
    if (!user) return;
    setIsUpdatingRequest(request.id);
    
    const batch = writeBatch(db);
    const requestRef = doc(db, "matchRequests", request.id);
    const updateData = { status: status };
    batch.update(requestRef, updateData);

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
    
    batch.commit()
      .then(() => {
        toast({
            title: `Request ${status}`,
            description: `You have ${status} the match request.`
        });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: requestRef.path,
          operation: 'update',
          requestResourceData: updateData,
        }));
      })
      .finally(() => {
        setIsUpdatingRequest(null);
      });
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
          <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Incoming Requests</h4>
                <p className="text-sm text-muted-foreground">
                  View profiles and decide who to connect with.
                </p>
              </div>
              <div className="grid gap-3">
                {incomingRequests.length > 0 ? (
                  incomingRequests.map(req => (
                    <div key={req.id} className="rounded-lg border bg-card p-4 flex flex-col gap-3 shadow-sm">
                      <div>
                        <p className="text-sm font-bold truncate">From: {req.requesterName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Wants to match with: <span className="text-primary font-medium">{req.targetPetName}</span></p>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="w-full h-9 flex items-center justify-center gap-2"
                        onClick={() => {
                          setIsPopoverOpen(false);
                          router.push(`/profile/${req.requesterId}`);
                        }}
                      >
                        <User className="h-4 w-4" />
                        View Profile
                      </Button>

                      <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="default" 
                            className={cn("h-9 px-2 flex-1 border-none", buttonTone.positive)}
                            onClick={() => handleRequestResponse(req, 'accepted')}
                            disabled={isUpdatingRequest === req.id}
                          >
                             {isUpdatingRequest === req.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Check className="h-4 w-4" />}
                             <span className="ml-1">Accept</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            className="h-9 px-2 flex-1"
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
                  <p className="text-sm text-muted-foreground text-center py-6 border-2 border-dashed rounded-lg">No new requests.</p>
                )}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {loading ? (
        <div className={PET_GRID}>
          {[...Array(5)].map((_, i) => (
            <Card key={i} className={cn(surfaceVariants({ variant: "card", padding: "none" }), "overflow-hidden")}>
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-2 p-3">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                </div>
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
                </p>
            </CardContent>
        </Card>
      ) : (
        <div className={PET_GRID}>
          {displayPets.map((pet) => {
            const buttonState = getButtonState(pet);
            return (
                <Card key={pet.id} className={cn(surfaceVariants({ variant: "interactive", padding: "none" }), "flex flex-col overflow-hidden cursor-default")}>
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image 
                    src={pet.image} 
                    alt={pet.name} 
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    data-ai-hint={pet.dataAiHint}
                    />
                </div>
                <div className="flex flex-1 flex-col p-3">
                    <h3 className="font-headline text-sm sm:text-base font-bold leading-tight truncate">{pet.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{pet.breed}</p>
                    <Button 
                        size="sm"
                        className="mt-3 w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
                        onClick={() => handleMatchRequest(pet)}
                        disabled={buttonState.disabled}
                    >
                        <buttonState.icon className={`mr-1 h-3.5 w-3.5 ${buttonState.className}`} />
                        {buttonState.text}
                    </Button>
                </div>
                </Card>
            );
        })}
        </div>
      )}

      {!loading && hasMorePets && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => fetchPets(true)} disabled={loadingMore} className="min-w-40">
            {loadingMore ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loadingMore ? "Loading..." : "Load more pets"}
          </Button>
        </div>
      )}
    </div>
  );
}