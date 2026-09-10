
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, doc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clock,
  ChevronRight,
  RefreshCw,
  Sun,
  Activity,
  Footprints,
  Scale,
  MessageSquare,
  Briefcase,
  TrendingUp,
  User
} from "lucide-react";

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  
  // Data State
  const [petData, setPetData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [matchedProfilesCount, setMatchedProfilesCount] = useState(0);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Provider specific state
  const [newBookings, setNewBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    if (userRole === 'owner') {
      const petRef = doc(db, "pets", user.uid);
      const unsubscribePet = onSnapshot(petRef, (docSnap) => {
        if (docSnap.exists()) {
          setPetData({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      });

      const requestsQuery = query(
        collection(db, "matchRequests"),
        where("targetOwnerId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => setPendingRequests(snapshot.size));

      // Removed orderBy to avoid composite index error
      const bookingsQuery = query(
        collection(db, "bookings"), 
        where("ownerId", "==", user.uid),
        where("status", "==", "accepted")
      );
      const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort client-side by date
          data.sort((a: any, b: any) => a.date.localeCompare(b.date));
          setUpcomingBooking(data[0]);
        } else {
          setUpcomingBooking(null);
        }
      });

      return () => {
        unsubscribePet();
        unsubscribeRequests();
        unsubscribeBookings();
      };
    } else if (userRole === 'provider') {
      // Removed orderBy to avoid composite index error
      const providerBookingsQuery = query(
        collection(db, "bookings"),
        where("serviceProviderId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubscribeProviderBookings = onSnapshot(providerBookingsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort client-side by creation date
        data.sort((a: any, b: any) => {
          const timeA = a.createdAt?.toDate?.() || new Date(0);
          const timeB = b.createdAt?.toDate?.() || new Date(0);
          return timeB - timeA;
        });
        setNewBookings(data.slice(0, 3));
        setLoading(false);
      });

      return () => unsubscribeProviderBookings();
    }
  }, [user, userRole]);

  useEffect(() => {
    if (!user) return;
    const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => setMatchedProfilesCount(snapshot.size));
    return () => unsubscribeChats();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  // Render Owner Dashboard
  if (userRole === 'owner') {
    return (
      <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
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
          <div className="lg:col-span-8 space-y-8">
            <Card className="border-none shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="p-8 space-y-8">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg rounded-2xl overflow-hidden">
                          <AvatarImage src={petData?.avatar || "/images/logo.png"} className="object-cover" />
                          <AvatarFallback><PawPrintIcon className="h-10 w-10" /></AvatarFallback>
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
                      </div>
                    </div>

                    <div className="w-full md:w-auto space-y-3">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-bold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-primary" /> Today's Wellness Plan
                        </span>
                        <span className="text-xs font-bold text-primary">75%</span>
                      </div>
                      <Progress value={75} className="h-2 bg-muted w-full md:w-64" />
                      <div className="grid grid-cols-2 gap-2">
                        <Badge variant="outline" className="bg-green-50 border-green-100 text-[10px] py-1 justify-start">
                          <CheckCircle className="h-3 w-3 mr-1 text-green-600" /> Morning Walk
                        </Badge>
                        <Badge variant="outline" className="bg-muted border-none text-[10px] py-1 justify-start">
                          <Clock className="h-3 w-3 mr-1" /> Feeding Time
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
                        <p className="text-sm font-bold">{petData?.weight || '31.2'} kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                        <Footprints className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Activity</p>
                        <p className="text-sm font-bold">{petData?.currentActivity || '4.2'} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Checkup</p>
                        <p className="text-sm font-bold">{petData?.nextCheckup || 'Oct 24'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <Link href="/records">
                        <Button variant="link" className="text-primary text-xs font-bold p-0">
                          View Records <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" /> Upcoming Booking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingBooking ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/20 rounded-xl border border-muted">
                        <p className="font-bold text-lg">{upcomingBooking.serviceType}</p>
                        <p className="text-sm text-muted-foreground">with {upcomingBooking.serviceProviderName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none">{upcomingBooking.date}</Badge>
                          <Badge variant="outline">{upcomingBooking.time}</Badge>
                        </div>
                      </div>
                      <Link href="/bookings">
                        <Button variant="outline" className="w-full">Manage Bookings</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-xl">
                      <p className="text-sm">No confirmed sessions.</p>
                      <Link href="/providers">
                        <Button variant="link" className="text-xs text-primary mt-2">Find a service provider</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" /> Neighborhood Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="flex items-center justify-between">
                     <p className="text-sm text-muted-foreground">Nearby Playmates</p>
                     <span className="font-bold text-sm">12 Active</span>
                   </div>
                   <div className="flex items-center justify-between">
                     <p className="text-sm text-muted-foreground">Grooming Deals</p>
                     <span className="font-bold text-sm text-primary">2 Local</span>
                   </div>
                   <Link href="/match">
                    <Button variant="secondary" className="w-full text-xs font-bold mt-2">Find Playmates</Button>
                   </Link>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-tighter text-muted-foreground font-bold">
                  <Bell className="h-4 w-4" /> Match Requests
                </CardTitle>
                {pendingRequests > 0 && (
                  <Badge className="bg-orange-100 text-orange-600 border-none rounded-full px-2 py-0">
                    {pendingRequests} New
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {pendingRequests > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      You have new match requests from pet owners nearby.
                    </p>
                    <Link href="/match">
                      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-xs">View All Requests</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                     <PawPrintIcon className="mx-auto h-8 w-8 text-muted/30 mb-2" />
                     <p className="text-xs text-muted-foreground">No new requests today.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2 uppercase tracking-tighter text-muted-foreground font-bold">
                  <MessageSquare className="h-4 w-4" /> Recent Chats
                </CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-xl flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {matchedProfilesCount}
                       </div>
                       <div>
                          <p className="text-xs font-bold">Active Conversations</p>
                          <p className="text-[10px] text-muted-foreground">Keep in touch with your matches.</p>
                       </div>
                    </div>
                    <Link href="/chats">
                      <Button variant="outline" className="w-full text-xs">Open Messages</Button>
                    </Link>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Render Provider Dashboard
  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            Business Overview, {user?.displayName?.split(' ')[0]}! <TrendingUp className="h-8 w-8 text-green-500" />
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your service schedule and grow your pet business.
          </p>
        </div>
        <Link href="/business-profile">
          <Button variant="outline" className="rounded-full bg-white shadow-sm border-none flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span>My Listing</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Bookings</CardDescription>
            <CardTitle className="text-3xl font-bold">128</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
              <TrendingUp className="h-3 w-3" /> +12% this month
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Customer Rating</CardDescription>
            <CardTitle className="text-3xl font-bold">4.9/5</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => <StarIcon key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Match Efficiency</CardDescription>
            <CardTitle className="text-3xl font-bold">92%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={92} className="h-2 bg-muted" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Booking Requests</CardTitle>
                <CardDescription>New requests waiting for your approval.</CardDescription>
              </div>
              <Link href="/bookings">
                <Button variant="link" className="text-primary text-xs font-bold">View Schedule</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {newBookings.length > 0 ? (
                <div className="space-y-4">
                   {newBookings.map((req) => (
                     <div key={req.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-muted">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10">
                              <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
                           </Avatar>
                           <div>
                              <p className="font-bold text-sm">{req.serviceType}</p>
                              <p className="text-[10px] text-muted-foreground">{req.date} at {req.time}</p>
                           </div>
                        </div>
                        <Link href="/bookings">
                          <Button size="sm" className="h-8 text-xs">Manage</Button>
                        </Link>
                     </div>
                   ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                   <Calendar className="mx-auto h-12 w-12 text-muted/20 mb-3" />
                   <p className="text-sm text-muted-foreground font-medium">No pending requests.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-sm bg-accent text-accent-foreground rounded-2xl overflow-hidden">
             <CardHeader>
                <CardTitle className="text-lg">Grow Your Reach</CardTitle>
             </CardHeader>
             <CardContent>
                <p className="text-sm opacity-90 leading-relaxed mb-6">
                  Complete your profile and add high-quality service photos to attract more pet owners in your area.
                </p>
                <Link href="/business-profile">
                  <Button variant="secondary" className="w-full font-bold">Update My Listing</Button>
                </Link>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StarIcon(props: any) {
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
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function PawPrintIcon(props: any) {
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
