
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, doc, getDoc, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  Bell, 
  Calendar, 
  FileText, 
  User, 
  HeartHandshake, 
  AlertTriangle, 
  MessageSquare, 
  Briefcase, 
  Star, 
  CheckCircle, 
  Heart, 
  ExternalLink,
  Clock,
  ChevronRight,
  Search,
  RefreshCw,
  Sun,
  MapPin,
  MoreVertical,
  Navigation,
  Activity,
  Footprints,
  Scale
} from "lucide-react";

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  
  // Data State
  const [petData, setPetData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [matchedProfilesCount, setMatchedProfilesCount] = useState(0);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch Pet Data
    const petRef = doc(db, "pets", user.uid);
    const unsubscribePet = onSnapshot(petRef, (docSnap) => {
      if (docSnap.exists()) {
        setPetData({ id: docSnap.id, ...docSnap.data() });
      }
      setLoading(false);
    });

    // Fetch Match Requests
    const requestsQuery = query(
      collection(db, "matchRequests"),
      where("targetOwnerId", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => setPendingRequests(snapshot.size));

    // Fetch Chats
    const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => setMatchedProfilesCount(snapshot.size));
    
    // Fetch Bookings
    const bookingsQuery = query(
      collection(db, "bookings"), 
      where("ownerId", "==", user.uid),
      where("status", "==", "accepted"),
      orderBy("date", "asc"),
      limit(1)
    );
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      if (!snapshot.empty) {
        setUpcomingBooking({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setUpcomingBooking(null);
      }
    });

    return () => {
      unsubscribePet();
      unsubscribeRequests();
      unsubscribeChats();
      unsubscribeBookings();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            Good morning, {user?.displayName?.split(' ')[0] || 'Nandini'}! <Sun className="h-8 w-8 text-yellow-500" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with {petData?.name || 'Bruno'} today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full bg-white shadow-sm border-none flex items-center gap-2 pr-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={petData?.avatar || "/images/logo.png"} />
              <AvatarFallback>{petData?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Switch Pet ({petData?.name || 'Bruno'})</span>
            <ChevronRight className="h-4 w-4 rotate-90" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm border-none">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Wellness Plan Card */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              <div className="p-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-lg rounded-2xl">
                        <AvatarImage src={petData?.avatar || "/images/logo.png"} className="object-cover" />
                        <AvatarFallback><PawPrint className="h-10 w-10" /></AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white h-6 w-6 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold">{petData?.name || 'Bruno'}</h2>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 py-0.5 rounded-full text-xs font-bold">
                          • Healthy & Active
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-medium mt-1">
                        {petData?.breed || 'Golden Retriever'} • {petData?.age || '2 yrs 3 mos'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        ID: <span className="text-primary font-bold">#PM-8924-BLR</span>
                      </p>
                    </div>
                  </div>

                  <div className="w-full md:w-auto space-y-3">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm font-bold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-primary" /> Today's Wellness Plan
                      </span>
                      <span className="text-xs font-bold text-primary">3 of 4 Milestones (75%)</span>
                    </div>
                    <Progress value={75} className="h-2 bg-muted w-full md:w-64" />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="outline" className="bg-green-50 border-green-100 text-[10px] py-1 justify-start">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> Morning Walk
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 border-green-100 text-[10px] py-1 justify-start">
                        <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> Supplements
                      </Badge>
                      <Badge variant="outline" className="bg-orange-50 border-orange-100 text-[10px] py-1 justify-start text-orange-600">
                        <Clock className="h-3 w-3 mr-1" /> Playdate 5:00 PM
                      </Badge>
                      <Badge variant="outline" className="bg-muted border-none text-[10px] py-1 justify-start">
                        <Calendar className="h-3 w-3 mr-1" /> Rabies Booster
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Scale className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Weight</p>
                      <p className="text-sm font-bold">31.2 kg <span className="text-green-600 font-medium">(Ideal)</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Footprints className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Activity</p>
                      <p className="text-sm font-bold">4.2 / 6.0 km</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Next Checkup</p>
                      <p className="text-sm font-bold">Oct 24, 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end">
                    <Link href="/records">
                      <Button variant="link" className="text-primary text-xs font-bold p-0">
                        View Full Health Records <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placeholder for Quick Actions & Neighborhood */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
             <Skeleton className="h-[150px] w-full" />
             <Skeleton className="h-[150px] w-full" />
          </div>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Notifications Card */}
          <Card className="border-none shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-tighter text-muted-foreground">
                <Bell className="h-4 w-4" /> Playdate Requests
              </CardTitle>
              {pendingRequests > 0 && (
                <Badge className="bg-orange-100 text-orange-600 hover:bg-orange-100 border-none rounded-full px-2 py-0">
                  {pendingRequests} Pending
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">
                Two pet buddies in your neighborhood want to meet {petData?.name || 'Bruno'} for an outdoor session.
              </p>
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <Link href="/match" className="block text-center mt-4 text-xs font-bold text-primary hover:underline">
                Browse All Match Recommendations →
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 uppercase tracking-tighter text-muted-foreground">
                <MessageSquare className="h-4 w-4" /> Recent Pet Chats
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
               </div>
               <Link href="/chats">
                <Button variant="secondary" className="w-full mt-4 text-xs font-bold bg-muted/50 border-none shadow-none">
                  Open All Messages ({matchedProfilesCount} Unread) →
                </Button>
               </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PawPrint(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="5" r="2" />
      <circle cx="18" cy="9" r="2" />
      <circle cx="7" cy="9" r="2" />
      <circle cx="14" cy="5" r="2" />
      <path d="M12 13c-2 0-4 1-4 3 0 2 2 4 4 4s4-2 4-4c0-2-2-3-4-3Z" />
      <path d="M12 21c-3.1 0-6-2.3-6-5.5s2.9-5.5 6-5.5 6 2.3 6 5.5-2.9 5.5-6 5.5Z" />
    </svg>
  )
}
