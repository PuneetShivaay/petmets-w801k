
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, doc, getDocs, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Bell, 
  Calendar, 
  CheckCircle, 
  Clock,
  ChevronRight,
  Sun,
  Activity,
  Footprints,
  Scale,
  MessageSquare,
  Briefcase,
  TrendingUp,
  User,
  Dog,
  Scissors,
  GraduationCap,
  MapPin,
  Star,
  Navigation,
  Droplets,
  Heart,
  ChevronDown,
  FileText as FileTextIcon
} from "lucide-react";

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  
  // Data State
  const [petData, setPetData] = useState<any>(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [matchedProfilesCount, setMatchedProfilesCount] = useState(0);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [localProviders, setLocalProviders] = useState<any[]>([]);

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

      const bookingsQuery = query(
        collection(db, "bookings"), 
        where("ownerId", "==", user.uid),
        where("status", "==", "accepted")
      );
      const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          data.sort((a: any, b: any) => a.date.localeCompare(b.date));
          setUpcomingBooking(data[0]);
        } else {
          setUpcomingBooking(null);
        }
      });

      // Fetch local providers for "In your neighborhood"
      const fetchLocal = async () => {
        const q = query(collection(db, "service_providers"), limit(3));
        const snap = await getDocs(q);
        setLocalProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      fetchLocal();

      return () => {
        unsubscribePet();
        unsubscribeRequests();
        unsubscribeBookings();
      };
    } else if (userRole === 'provider') {
      const providerBookingsQuery = query(
        collection(db, "bookings"),
        where("serviceProviderId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubscribeProviderBookings = onSnapshot(providerBookingsQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      <div className="flex flex-col min-h-screen bg-[#FDFBF9] animate-in fade-in duration-700 pb-20 md:pb-0">
        {/* Mobile Header */}
        <div className="sticky top-0 z-30 bg-[#FDFBF9]/80 backdrop-blur-md px-4 py-4 flex items-center justify-between md:hidden border-b border-orange-100">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-2" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Pet</span>
                 <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-sm font-bold">{petData?.name || 'Buddy'} • {petData?.breed || 'Golden Retriever'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
                <Bell className="h-6 w-6 text-muted-foreground" />
                {pendingRequests > 0 && (
                  <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary border-2 border-[#FDFBF9]" />
                )}
             </div>
             <Avatar className="h-8 w-8 border border-muted shadow-sm">
                <AvatarImage src={user?.photoURL || "/images/logo.png"} />
                <AvatarFallback><User className="h-5 w-5" /></AvatarFallback>
             </Avatar>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 space-y-8 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {/* Greeting & Summary */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Happy Sunday ☀️</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight font-headline">
                  Good morning, {user?.displayName?.split(' ')[0] || 'Parent'}!
                </h1>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold text-[10px]">
                   <CheckCircle className="h-3 w-3" /> Active Parent
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Main Content */}
            <div className="lg:col-span-8 space-y-8">
              {/* Main Pet Status Card */}
              <Card className="border-none shadow-xl shadow-orange-900/5 bg-white rounded-[2.5rem] overflow-hidden p-6 sm:p-8">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-20 w-20 border-4 border-white shadow-xl rounded-2xl overflow-hidden">
                          <AvatarImage src={petData?.avatar || "/images/logo.png"} className="object-cover" />
                          <AvatarFallback><PawPrintIcon className="h-8 w-8 text-muted" /></AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white h-5 w-5 rounded-full" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{petData?.name || 'Buddy'}</h2>
                        <p className="text-sm text-muted-foreground font-medium">
                          {petData?.breed || 'Golden Retriever'} • {petData?.age || '3 yrs'}
                        </p>
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-3 mt-1 rounded-full text-[9px] font-bold">
                          Healthy & Active
                        </Badge>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end text-right">
                       <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                          <CheckCircle className="h-4 w-4" /> Morning Walk Done
                       </div>
                       <div className="flex items-center gap-2 text-primary font-bold text-sm mt-1">
                          <div className="h-2 w-2 rounded-full bg-primary" /> Shots in 12d
                       </div>
                    </div>
                  </div>

                  {/* Milestones / Wellness Progress */}
                  <div className="space-y-3 pt-4 border-t border-dashed">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today's Wellness Plan</span>
                       <span className="text-xs font-bold text-primary">3 of 4 Milestones</span>
                    </div>
                    <Progress value={75} className="h-2.5 bg-muted rounded-full overflow-hidden" />
                  </div>

                  {/* Reminders Row Mobile */}
                  <div className="flex sm:hidden items-center justify-between gap-4 py-2">
                     <div className="flex items-center gap-2 text-[10px] font-bold text-green-600">
                        <CheckCircle className="h-3 w-3" /> Morning Walk Done
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" /> Shots in 12d
                     </div>
                  </div>
                </div>
              </Card>

              {/* Match Alert Banner */}
              {pendingRequests > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-3xl p-5 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-500">
                   <div className="flex items-center gap-4">
                      <div className="flex -space-x-3">
                         {[...Array(2)].map((_, i) => (
                           <Avatar key={i} className="h-10 w-10 border-2 border-white">
                              <AvatarImage src={`https://picsum.photos/seed/${i+100}/100/100`} />
                              <AvatarFallback><User /></AvatarFallback>
                           </Avatar>
                         ))}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Playdate Alerts</p>
                        <p className="text-sm font-bold text-accent">{pendingRequests} pet matches waiting...</p>
                      </div>
                   </div>
                   <Link href="/match">
                     <Button size="sm" className="rounded-xl px-4 py-5 font-bold flex items-center gap-2">
                       Review <ChevronRight className="h-4 w-4" />
                     </Button>
                   </Link>
                </div>
              )}

              {/* Quick Care Actions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Quick Care Actions</h3>
                  <Link href="/providers" className="text-xs font-bold text-primary">All Services (8)</Link>
                </div>
                <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                  {[
                    { label: 'Walker', icon: User, color: 'text-red-500', href: '/providers?service=Walking' },
                    { label: 'Grooming', icon: Scissors, color: 'text-orange-500', href: '/providers?service=Grooming' },
                    { label: 'Playdate', icon: Dog, color: 'text-amber-600', href: '/match' },
                    { label: 'Records', icon: FileTextIcon, color: 'text-green-600', href: '/records' },
                    { label: 'Adoption', icon: Heart, color: 'text-blue-500', href: '/adoption' },
                  ].map((item, i) => (
                    <Link key={i} href={item.href} className="flex-shrink-0">
                      <Card className="w-20 sm:w-24 border-none shadow-sm bg-white hover:shadow-md transition-all rounded-3xl">
                        <CardContent className="p-4 flex flex-col items-center gap-3">
                          <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center bg-muted/30", item.color)}>
                            <item.icon className="h-6 w-6" />
                          </div>
                          <span className="text-[10px] font-bold text-center uppercase tracking-wider">{item.label}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Upcoming Appointment */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Upcoming Appointment</h3>
                  <span className="text-xs font-bold text-muted-foreground uppercase">Next Activity</span>
                </div>
                {upcomingBooking ? (
                  <Card className="border-none shadow-xl shadow-orange-900/5 bg-white rounded-[2rem] p-6 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl" />
                    <div className="flex flex-col gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                           <Droplets className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <Badge className="bg-green-100 text-green-700 border-none font-bold text-[9px] uppercase tracking-wider">Confirmed</Badge>
                             <span className="text-xs font-medium text-muted-foreground">• {upcomingBooking.serviceType}</span>
                          </div>
                          <h4 className="text-xl font-bold mt-1">{upcomingBooking.serviceProviderName}</h4>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/30 p-3 rounded-2xl flex items-center gap-2">
                           <Clock className="h-4 w-4 text-primary" />
                           <span className="text-xs font-bold">{upcomingBooking.date}, {upcomingBooking.time}</span>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-2xl flex items-center gap-2">
                           <MapPin className="h-4 w-4 text-primary" />
                           <span className="text-xs font-bold truncate">Nearby</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                         <Button variant="outline" className="flex-1 rounded-2xl font-bold py-6 text-xs bg-muted/20 border-none">
                            <Navigation className="h-4 w-4 mr-2" /> Directions
                         </Button>
                         <Link href="/bookings" className="flex-1">
                           <Button className="w-full rounded-2xl font-bold py-6 text-xs shadow-lg shadow-orange-900/20">
                              <Briefcase className="h-4 w-4 mr-2" /> View Booking
                           </Button>
                         </Link>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-[2rem] flex flex-col items-center">
                    <Calendar className="h-10 w-10 opacity-10 mb-2" />
                    <p className="text-sm font-medium">No sessions scheduled.</p>
                    <Link href="/providers">
                      <Button variant="link" className="text-xs text-primary mt-1 font-bold">Book a service now</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar Content */}
            <div className="lg:col-span-4 space-y-8">
              {/* In Your Neighborhood */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">In Your Neighborhood</h3>
                    <Link href="/providers" className="text-xs font-bold text-primary">See Map</Link>
                 </div>
                 <div className="grid gap-6">
                    {localProviders.map((provider) => (
                       <Card key={provider.id} className="border-none shadow-md bg-white rounded-[2rem] overflow-hidden">
                          <div className="relative h-40 w-full">
                             <Image 
                              src={provider.image || "/images/logo.png"} 
                              alt={provider.name}
                              fill
                              className="object-cover"
                              data-ai-hint="service provider"
                             />
                             <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full shadow-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-[10px] font-bold">{provider.rating}</span>
                             </div>
                          </div>
                          <CardContent className="p-4">
                             <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-sm truncate">{provider.name}</h4>
                                <Link href={`/providers/${provider.id}`}>
                                  <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold uppercase tracking-wider cursor-pointer">Book</Badge>
                                </Link>
                             </div>
                             <p className="text-[10px] text-muted-foreground truncate">{provider.location}</p>
                          </CardContent>
                       </Card>
                    ))}
                 </div>
              </div>

              {/* Messages & Community */}
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Community Insights</h3>
                    <Link href="/chats" className="text-xs font-bold text-primary">Open Chats</Link>
                 </div>
                 <div className="space-y-3">
                    <Link href="/chats">
                       <Card className="border-none shadow-sm bg-white rounded-3xl p-4 flex items-center justify-between hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                             <Avatar className="h-12 w-12 border border-muted shadow-sm">
                                <AvatarImage src="https://picsum.photos/seed/user1/100/100" />
                                <AvatarFallback><User /></AvatarFallback>
                             </Avatar>
                             <div className="space-y-1">
                                <p className="text-sm font-bold">Recent Message</p>
                                <p className="text-xs text-muted-foreground truncate max-w-[150px]">Check out the new park!</p>
                             </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                       </Card>
                    </Link>

                    <Card className="border-none shadow-sm bg-orange-50/50 rounded-3xl p-6 flex items-start gap-4">
                       <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm flex-shrink-0">
                          <Sun className="h-5 w-5" />
                       </div>
                       <div className="space-y-1">
                          <h4 className="text-sm font-bold">Wellness Tip</h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Hydration is key today! Humidity is higher than usual.
                          </p>
                       </div>
                    </Card>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Provider Dashboard
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
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
