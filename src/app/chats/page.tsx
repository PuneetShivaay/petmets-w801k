
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface Chat {
  id: string;
  participants: string[];
  participantEmails: string[];
  lastMessage: string;
  lastMessageTimestamp: any;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

interface UserProfile {
    avatar: string;
    dataAiHint: string;
    name: string;
}

export default function ChatsPage() {
  const { user, isLoading: authIsLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
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
    if (!user) return;

    setIsLoadingChats(true);
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', user.uid));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatsData: Chat[] = [];
      const allParticipantIds = new Set<string>();

      querySnapshot.forEach(doc => {
        const data = doc.data();
        const chat = { id: doc.id, ...data } as Chat;
        chatsData.push(chat);
        data.participants.forEach((p: string) => allParticipantIds.add(p));
      });
      
      chatsData.sort((a, b) => b.lastMessageTimestamp?.toMillis() - a.lastMessageTimestamp?.toMillis());
      
      setChats(chatsData);
      await fetchUserProfiles(Array.from(allParticipantIds));
      setIsLoadingChats(false);
    });

    return () => unsubscribe();
  }, [user, fetchUserProfiles]);


  useEffect(() => {
    if (!activeChatId) {
        setMessages([]);
        return;
    };

    setIsLoadingMessages(true);
    const messagesQuery = query(collection(db, `chats/${activeChatId}/messages`), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messagesData);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [activeChatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !activeChatId) return;

    setIsSending(true);
    const messageText = newMessage;
    setNewMessage('');

    try {
      const chatRef = doc(db, 'chats', activeChatId);
      const messagesColRef = collection(chatRef, 'messages');

      await addDoc(messagesColRef, {
        text: messageText,
        senderId: user.uid,
        timestamp: serverTimestamp(),
      });
      
      await updateDoc(chatRef, {
          lastMessage: messageText,
          lastMessageTimestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error("Error sending message:", error);
      // Re-set the input so the user can try again
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };
  
  const getOtherParticipant = (chat: Chat) => {
      return chat.participants.find(p => p !== user?.uid);
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Pet Chats"
        description="Talk with other pet owners you've matched with."
      />
      <div className="flex-grow grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
        {/* Chat List */}
        <Card className="md:col-span-1 lg:col-span-1 h-full flex flex-col">
            <CardHeader>
                <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-grow">
                <ScrollArea className="h-full">
                    <div className="p-2 space-y-2">
                    {isLoadingChats ? (
                        [...Array(3)].map((_,i) => <Skeleton key={i} className="h-16 w-full" />)
                    ) : chats.length > 0 ? (
                        chats.map(chat => {
                            const otherUserId = getOtherParticipant(chat);
                            const profile = otherUserId ? userProfiles[otherUserId] : undefined;
                            return (
                                <button
                                    key={chat.id}
                                    onClick={() => setActiveChatId(chat.id)}
                                    className={cn(
                                        "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors",
                                        activeChatId === chat.id ? "bg-primary/10" : "hover:bg-muted"
                                    )}
                                >
                                <Avatar>
                                    <AvatarImage src={profile?.avatar} data-ai-hint={profile?.dataAiHint} />
                                    <AvatarFallback><User /></AvatarFallback>
                                </Avatar>
                                <div className="flex-grow overflow-hidden">
                                    <p className="font-semibold truncate">{profile?.name || 'Loading...'}</p>
                                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                                </div>
                                {chat.lastMessageTimestamp && (
                                     <p className="text-xs text-muted-foreground self-start shrink-0">
                                        {formatDistanceToNow(chat.lastMessageTimestamp.toDate(), { addSuffix: true })}
                                    </p>
                                )}
                                </button>
                            )
                        })
                    ) : (
                        <p className="p-4 text-center text-muted-foreground">No chats yet. Accept a match request to start a conversation!</p>
                    )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>

        {/* Message View */}
        <Card className="md:col-span-2 lg:col-span-3 h-full flex flex-col">
          {activeChatId ? (
            <>
              <CardHeader className="border-b">
                 <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow p-0">
                <ScrollArea className="h-full p-4">
                  {isLoadingMessages ? (
                      <div className="space-y-4">
                          <Skeleton className="h-10 w-3/5" />
                          <Skeleton className="h-10 w-3/5 ml-auto" />
                          <Skeleton className="h-10 w-2/5" />
                      </div>
                  ) : (
                    <div className="space-y-4">
                        {messages.map(message => (
                            <div key={message.id} className={cn("flex items-end gap-2", message.senderId === user?.uid ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "rounded-lg p-3 max-w-xs lg:max-w-md",
                                    message.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                  <Input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    disabled={isSending}
                    autoComplete="off"
                  />
                  <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <CardTitle className="font-headline text-2xl">Select a conversation</CardTitle>
                <p className="mt-2 text-muted-foreground">Choose a chat from the list to see the messages.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
