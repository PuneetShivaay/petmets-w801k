
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useLoading } from '@/contexts/loading-context';

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTimestamp: any;
}

interface UserProfile {
    avatar: string;
    dataAiHint: string;
    name: string;
}

export default function ChatsListPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const { showLoading } = useLoading();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  const fetchUserProfiles = useCallback(async (participantIds: string[]) => {
      const newProfiles: Record<string, UserProfile> = {};
      const idsToFetch = participantIds.filter(id => !userProfiles[id]);

      if (idsToFetch.length === 0) return;

      const profilePromises = idsToFetch.map(async (id) => {
          const userDoc = await getDoc(doc(db, 'users', id));
          if (userDoc.exists()) {
              const data = userDoc.data();
              newProfiles[id] = {
                  name: data.name || 'Pet Owner',
                  avatar: data.avatar || 'https://i.imgur.com/83AAQ1X.png',
                  dataAiHint: data.dataAiHint || 'paw print logo'
              };
          }
      });
      
      await Promise.all(profilePromises);
      setUserProfiles(prev => ({ ...prev, ...newProfiles }));

  }, [userProfiles]);


  useEffect(() => {
    if (authIsLoading || !user) return;

    setIsLoadingChats(true);
    // Simplified query to avoid needing a composite index.
    // We will sort the results on the client side.
    const q = query(
        collection(db, 'chats'), 
        where('participants', 'array-contains', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatsData: Chat[] = [];
      const allParticipantIds = new Set<string>();

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const chat = { id: doc.id, ...data } as Chat;
        chatsData.push(chat);
        data.participants.forEach((p: string) => allParticipantIds.add(p));
      });
      
      // Sort on the client-side
      chatsData.sort((a, b) => {
        const timeA = a.lastMessageTimestamp?.toDate() || new Date(0);
        const timeB = b.lastMessageTimestamp?.toDate() || new Date(0);
        return timeB.getTime() - timeA.getTime();
      });
      
      setChats(chatsData);
      if (allParticipantIds.size > 0) {
        await fetchUserProfiles(Array.from(allParticipantIds));
      }
      setIsLoadingChats(false);
    });

    return () => unsubscribe();
  }, [user, authIsLoading, fetchUserProfiles]);

  const handleChatSelect = (chatId: string) => {
    showLoading();
    router.push(`/chats/${chatId}`);
  };
  
  const getOtherParticipant = (chat: Chat) => {
      return chat.participants.find(p => p !== user?.uid);
  }

  return (
    <div className="space-y-8">
       <p className="text-lg text-muted-foreground text-center">Talk with other pet owners you've matched with.</p>
      <Card>
        <CardContent className="p-0">
          {isLoadingChats ? (
              <div className="space-y-2 p-4 sm:p-6">
                  {[...Array(3)].map((_,i) => <Skeleton key={i} className="h-20 w-full" />)}
              </div>
          ) : chats.length > 0 ? (
              <div className="space-y-1">
              {chats.map(chat => {
                  const otherUserId = getOtherParticipant(chat);
                  const profile = otherUserId ? userProfiles[otherUserId] : undefined;
                  return (
                      <button
                          key={chat.id}
                          onClick={() => handleChatSelect(chat.id)}
                          className="w-full text-left p-3 rounded-lg flex items-center gap-4 transition-colors hover:bg-muted"
                      >
                      <Avatar className="h-12 w-12">
                          <AvatarImage src={profile?.avatar} data-ai-hint={profile?.dataAiHint} />
                          <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      <div className="flex-grow overflow-hidden">
                          <p className="font-semibold truncate text-lg">{profile?.name || 'Loading...'}</p>
                          <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      </div>
                      {chat.lastMessageTimestamp && (
                           <p className="text-xs text-muted-foreground self-start shrink-0">
                              {formatDistanceToNow(chat.lastMessageTimestamp.toDate(), { addSuffix: true })}
                          </p>
                      )}
                      </button>
                  )
              })}
              </div>
          ) : (
            <div className="text-center py-10">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Conversations Yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Accept a match request to start a conversation!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
