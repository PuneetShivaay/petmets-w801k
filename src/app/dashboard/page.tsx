
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Bell, Calendar, FileText, User, HeartHandshake, AlertTriangle } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  href: string;
  actionText: string;
  isLoading: boolean;
}

function StatCard({ title, value, description, icon: Icon, href, actionText, isLoading }: StatCardProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-1/4 mt-1" />
            <Skeleton className="h-4 w-3/4 mt-2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
        <Link href={href} passHref>
          <Button variant="outline" size="sm" className="mt-4 w-full sm:w-auto">
            {actionText} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [upcomingBooking, setUpcomingBooking] = useState<{service: string, date: string} | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingProfileCheck, setLoadingProfileCheck] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Check for profile completeness
    const checkProfileCompleteness = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            // Profile is considered incomplete if phone or address is missing.
            if (!userData.phone || !userData.address) {
                setIsProfileComplete(false);
            }
        } else {
            // If the user doc doesn't even exist, it's definitely not complete.
            setIsProfileComplete(false);
        }
        setLoadingProfileCheck(false);
    };

    // Fetch pending match requests
    const requestsQuery = query(
      collection(db, "matchRequests"),
      where("targetOwnerId", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      setPendingRequests(snapshot.size);
      setLoadingRequests(false);
    });
    
    // MOCK: Fetch upcoming booking
    const mockUpcomingBookings = [
        { id: 1, service: "Grooming with Happy Paws", date: "in 3 days" },
    ];
    setUpcomingBooking(mockUpcomingBookings[0] || null);
    setLoadingBookings(false);

    checkProfileCompleteness();

    return () => {
      unsubscribeRequests();
    };
  }, [user]);

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

      {!loadingProfileCheck && !isProfileComplete && (
         <Card className="shadow-lg bg-primary/10 border-primary">
            <CardHeader className="flex flex-row items-center gap-4">
                <AlertTriangle className="h-8 w-8 text-primary" />
                <div>
                    <CardTitle className="text-xl sm:text-2xl">Complete Your Profile</CardTitle>
                    <CardDescription className="text-primary/90">
                        Fill out your pet and owner details to get the most out of PetMets and connect with others.
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Pending Match Requests"
          value={pendingRequests}
          description="Awaiting your response."
          icon={Bell}
          href="/"
          actionText="Review Requests"
          isLoading={loadingRequests}
        />
        <StatCard
          title="Upcoming Booking"
          value={upcomingBooking?.service || "None"}
          description={upcomingBooking ? `Scheduled for ${upcomingBooking.date}` : "No upcoming appointments."}
          icon={Calendar}
          href="/bookings"
          actionText="View Bookings"
          isLoading={loadingBookings}
        />
        <Card className="shadow-lg lg:col-span-1">
             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
                <HeartHandshake className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex flex-col space-y-2 pt-2">
                 <p className="text-xs text-muted-foreground">Manage your pet's life.</p>
                <Link href="/pet-profile" passHref><Button variant="secondary" className="w-full justify-start"><User className="mr-2 h-4 w-4" />View Pet Profile</Button></Link>
                <Link href="/records" passHref><Button variant="secondary" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" />Manage Documents</Button></Link>
                <Link href="/providers" passHref><Button variant="secondary" className="w-full justify-start"><Calendar className="mr-2 h-4 w-4" />Book New Service</Button></Link>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
