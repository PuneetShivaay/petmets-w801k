
"use client";

import { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/auth-context';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
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

interface UserProfile {
    avatar: string;
    dataAiHint: string;
    name: string;
}

export default function ChatPage({ params }: { params: { chatId: string } }) {
  const { user } = useAuth();
  const { hideLoading } = useLoading();
  const { chatId } = params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);

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
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setOtherUser({
                        name: data.name || 'Pet Owner',
                        avatar: data.avatar || 'https://i.imgur.com/83AAQ1X.png',
                        dataAiHint: data.dataAiHint || 'paw print logo'
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

  return (
    <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="border-b flex flex-row items-center gap-4">
            <Link href="/chats" passHref>
                <Button variant="ghost" size="icon" aria-label="Back to conversations">
                    <ArrowLeft />
                </Button>
            </Link>
            {otherUser ? (
                <>
                <Avatar>
                    <AvatarImage src={otherUser.avatar} data-ai-hint={otherUser.dataAiHint} />
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <h2 className="text-lg font-semibold">{otherUser.name}</h2>
                </>
            ) : (
                <Skeleton className="h-8 w-40" />
            )}
        </CardHeader>
        <CardContent className="flex-grow p-0">
            <ScrollArea className="h-full max-h-[calc(100vh-250px)] p-4">
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
                                <p className="text-sm break-words">{message.text}</p>
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
    </Card>
  );
}

