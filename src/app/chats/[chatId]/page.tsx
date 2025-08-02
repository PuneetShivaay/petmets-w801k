
"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, User, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLoading } from '@/contexts/loading-context';

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

interface OtherUser {
    id: string;
    avatar: string;
    dataAiHint: string;
    name: string;
    petName?: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { hideLoading, showLoading } = useLoading();
  const params = useParams();
  const router = useRouter();
  const chatId = params.chatId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide the global page loader that was triggered when navigating here.
    hideLoading();
  }, [hideLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);
  
  useEffect(() => {
    if (!chatId || !user) return;
    
    const fetchChatInfo = async () => {
        const chatDocRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatDocRef);
        if (chatDoc.exists()) {
            const chatData = chatDoc.data();
            const otherUserId = chatData.participants.find((p: string) => p !== user.uid);
            if (otherUserId) {
                const userDoc = await getDoc(doc(db, 'users', otherUserId));
                const petDoc = await getDoc(doc(db, 'users', otherUserId, 'pets', 'main-pet'));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    const petData = petDoc.exists() ? petDoc.data() : {};
                    setOtherUser({
                        id: otherUserId,
                        name: data.name || 'Pet Owner',
                        avatar: data.avatar || 'https://i.imgur.com/83AAQ1X.png',
                        dataAiHint: data.dataAiHint || 'paw print logo',
                        petName: petData.name
                    });
                }
            }
        }
    };
    fetchChatInfo();

  }, [chatId, user]);

  useEffect(() => {
    if (!chatId) return;

    setIsLoadingMessages(true);
    const messagesQuery = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(messagesData);
      setIsLoadingMessages(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatId) return;

    setIsSending(true);
    const messageText = newMessage;
    setNewMessage('');

    try {
      const chatRef = doc(db, 'chats', chatId);
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
      setNewMessage(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleGoBack = () => {
    showLoading();
    router.push('/chats');
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4">
         <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleGoBack}>
            <ArrowLeft className="h-5 w-5" />
         </Button>
         {otherUser ? (
             <Link href={`/profile/${otherUser.id}`} className="flex items-center gap-3 overflow-hidden" onClick={showLoading}>
                 <Avatar className="h-9 w-9">
                     <AvatarImage src={otherUser.avatar} data-ai-hint={otherUser.dataAiHint} />
                     <AvatarFallback><User /></AvatarFallback>
                 </Avatar>
                 <span className="font-semibold text-lg truncate">{otherUser.name}{otherUser.petName && ` - ${otherUser.petName}`}</span>
             </Link>
         ) : (
             <div className="flex items-center gap-3">
                 <Skeleton className="h-9 w-9 rounded-full" />
                 <Skeleton className="h-6 w-32" />
             </div>
         )}
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
            <div className="space-y-4 p-2">
                <Skeleton className="h-10 w-3/5" />
                <Skeleton className="h-10 w-3/5 ml-auto" />
                <Skeleton className="h-10 w-2/5" />
            </div>
        ) : (
            <div className="space-y-4">
                {messages.map(message => (
                    <div key={message.id} className={cn("flex items-end gap-2", message.senderId === user?.uid ? "justify-end" : "justify-start")}>
                        <div className={cn(
                            "rounded-lg p-2 sm:p-3 max-w-[80%]",
                            message.senderId === user?.uid ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}>
                            <p className="text-sm break-words">{message.text}</p>
                            {message.timestamp && (
                                <p className={cn(
                                    "text-xs mt-1 text-right",
                                    message.senderId === user?.uid ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                    {format(message.timestamp.toDate(), 'p')}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                    <div ref={messagesEndRef} />
            </div>
        )}
      </main>
      <footer className="p-4 border-t bg-background">
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
      </footer>
    </div>
  );
}
