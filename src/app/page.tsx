
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Bell, Calendar, FileText, User, HeartHandshake, AlertTriangle, MessageSquare, Briefcase, Star, CheckCircle, Heart, ExternalLink } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  href: string;
  actionText: string;
}

function StatCard({ title, value, description, icon: Icon, href, actionText }: StatCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Link href={href} passHref>
          <Button variant="outline" size="sm" className="mt-4 w-full sm:w-auto">
            {actionText} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function StatCardSkeleton() {
    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-5 w-2/5" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-1/4 mt-1" />
                <Skeleton className="h-4 w-3/4 mt-2" />
                <Skeleton className="h-9 w-[120px] mt-4" />
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  const { user, userRole } = useAuth();
  
  // Owner Stats
  const [pendingRequests, setPendingRequests] = useState(0);
  const [matchedProfilesCount, setMatchedProfilesCount] = useState(0);
  const [upcomingBooking, setUpcomingBooking] = useState<{service: string, date: string} | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  
  // Provider Stats
  const [pendingAppointments, setPendingAppointments] = useState(0);
  const [completedServices, setCompletedServices] = useState(0);
  const [averageRating, setAverageRating] = useState(5.0);
  const [isBusinessListed, setIsBusinessListed] = useState(false);

  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) return;

    if (userRole === 'owner') {
      const checkProfileCompleteness = async () => {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              if (!userData.phone || !userData.address) setIsProfileComplete(false);
          } else {
              setIsProfileComplete(false);
          }
      };

      const requestsQuery = query(
        collection(db, "matchRequests"),
        where("targetOwnerId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => setPendingRequests(snapshot.size));

      const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => setMatchedProfilesCount(snapshot.size));
      
      // Fetch from top-level bookings
      const bookingsQuery = query(
        collection(db, "bookings"), 
        where("ownerId", "==", user.uid),
        where("status", "==", "pending")
      );
      const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
          if (!snapshot.empty) {
              const b = snapshot.docs[0].data();
              setUpcomingBooking({ service: b.serviceType, date: b.date });
          } else {
              setUpcomingBooking(null);
          }
      });

      checkProfileCompleteness();
      setLoadingStats(false);

      return () => {
        unsubscribeRequests();
        unsubscribeChats();
        unsubscribeBookings();
      };
    } else if (userRole === 'provider') {
      const checkBusinessListing = async () => {
          const providerDocRef = doc(db, "service_providers", user.uid);
          const providerDocSnap = await getDoc(providerDocRef);
          if (providerDocSnap.exists()) {
              setIsBusinessListed(true);
              setAverageRating(providerDocSnap.data().rating || 5.0);
          } else {
              setIsBusinessListed(false);
          }
      };

      // Fetch from top-level bookings for provider
      const providerBookingsQuery = query(collection(db, "bookings"), where("serviceProviderId", "==", user.uid));
      
      const unsubscribeProviderBookings = onSnapshot(providerBookingsQuery, (snapshot) => {
          const pending = snapshot.docs.filter(d => d.data().status === 'pending').length;
          const completed = snapshot.docs.filter(d => d.data().status === 'completed' || d.data().status === 'accepted').length;
          setPendingAppointments(pending);
          setCompletedServices(completed);
      });

      checkBusinessListing();
      setLoadingStats(false);

      return () => unsubscribeProviderBookings();
    }
  }, [user, userRole]);

  if (userRole === 'provider') {
    return (
      <div className="space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Vendor Dashboard</h2>
          <p className="text-muted-foreground">Manage your pet services and connect with owners.</p>
        </div>

        {!loadingStats && !isBusinessListed && (
           <Card className="shadow-lg bg-primary/10 border-primary">
              <CardHeader className="flex flex-row items-center gap-4">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                  <div>
                      <CardTitle className="text-xl sm:text-2xl">List Your Business</CardTitle>
                      <CardDescription className="text-primary/90">
                          Register as a provider to start appearing in search results and receiving bookings.
                      </CardDescription>
                  </div>
              </CardHeader>
              <CardContent>
                  <Link href="/business-profile" passHref>
                      <Button size="sm">
                          Set Up Listing <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                  </Link>
              </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            title="Pending Appointments"
            value={pendingAppointments}
            description="Requests awaiting your attention."
            icon={Calendar}
            href="/bookings"
            actionText="View Schedule"
          />
          <StatCard
            title="Completed Services"
            value={completedServices}
            description="Total services provided to date."
            icon={CheckCircle}
            href="/bookings"
            actionText="View History"
          />
          <StatCard
            title="Average Rating"
            value={averageRating.toFixed(1)}
            description="Based on customer feedback."
            icon={Star}
            href="/business-profile"
            actionText="View Profile"
          />
          <Card className="shadow-lg lg:col-span-1">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quick Access</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent className="flex flex-col space-y-2 pt-2">
                   <p className="text-xs text-muted-foreground">Manage your presence.</p>
                  <Link href="/business-profile" passHref><Button variant="secondary" className="w-full justify-start"><User className="mr-2 h-4 w-4" />Business Profile</Button></Link>
                  <Link href="/providers" passHref><Button variant="secondary" className="w-full justify-start"><ExternalLink className="mr-2 h-4 w-4" />Preview Listing</Button></Link>
                  <Link href="/chats" passHref><Button variant="secondary" className="w-full justify-start"><MessageSquare className="mr-2 h-4 w-4" />Customer Chats</Button></Link>
              </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Owner Dashboard (Default)
  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.displayName || 'Pet Owner'}!
        </h2>
        <p className="text-muted-foreground">
          Here's a quick overview of what's happening in your pet's world.
        </p>
      </div>

      {!loadingStats && !isProfileComplete && (
         <Card className="shadow-lg bg-primary/10 border-primary">
            <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-xl sm:text-2xl">Complete Your Profile</CardTitle>
                    <CardDescription className="text-primary/90">
                        Fill out your pet and owner details to get the most out of PetMets.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <Link href="/pet-profile" passHref>
                    <Button size="sm">
                        Go to Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loadingStats ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            title="Pending Match Requests"
            value={pendingRequests}
            description="Awaiting your response."
            icon={Bell}
            href="/match"
            actionText="Review Requests"
          />
        )}
        {loadingStats ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            title="Matched Profiles"
            value={matchedProfilesCount}
            description="Connections you have made."
            icon={HeartHandshake}
            href="/chats"
            actionText="View Chats"
          />
        )}
        {loadingStats ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            title="Upcoming Booking"
            value={upcomingBooking?.service || "None"}
            description={upcomingBooking ? `Scheduled for ${upcomingBooking.date}` : "No upcoming appointments."}
            icon={Calendar}
            href="/bookings"
            actionText="View Bookings"
          />
        )}
        <Card className="shadow-lg lg:col-span-1">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-2 pt-2">
                 <p className="text-xs text-muted-foreground">Manage your pet's life.</p>
                <Link href="/pet-profile" passHref><Button variant="secondary" className="w-full justify-start"><User className="mr-2 h-4 w-4" />View Pet Profile</Button></Link>
                <Link href="/records" passHref><Button variant="secondary" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" />Manage Documents</Button></Link>
                <Link href="/providers" passHref><Button variant="secondary" className="w-full justify-start"><Calendar className="mr-2 h-4 w-4" />Book New Service</Button></Link>
                <Link href="/adoption" passHref><Button variant="secondary" className="w-full justify-start"><Heart className="mr-2 h-4 w-4" />Pet Adoption</Button></Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
