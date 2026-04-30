
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, CheckCircle, History, ListChecks, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: string;
  ownerId: string;
  serviceProviderId: string;
  serviceProviderName: string;
  serviceType: string;
  date: string;
  time: string;
  status: string;
}

export default function BookingManagementPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch from top-level bookings collection
    const fieldToFilter = userRole === 'provider' ? 'serviceProviderId' : 'ownerId';
    const q = query(
      collection(db, "bookings"),
      where(fieldToFilter, "==", user.uid),
      orderBy("date", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userRole]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!user) return;
    setIsDeleting(bookingId);
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      toast({ title: "Booking Cancelled", description: "The appointment has been removed." });
    } catch (error) {
      console.error("Delete error:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not cancel the booking." });
    } finally {
      setIsDeleting(null);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingBookings = bookings.filter(b => b.date >= today && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => b.date < today || b.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-muted-foreground md:max-w-2xl">View, schedule, and manage all pet service appointments in one place.</p>
        {userRole === 'owner' && (
          <Link href="/providers">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <CalendarPlus className="mr-2 h-4 w-4" /> Book New Service
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming"><ListChecks className="mr-2 h-4 w-4 inline-block" />Upcoming</TabsTrigger>
              <TabsTrigger value="past"><History className="mr-2 h-4 w-4 inline-block" />History</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Active Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                  ) : upcomingBookings.length > 0 ? (
                    <ul className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <li key={booking.id} className="rounded-md border p-4 shadow-sm bg-card transition-all hover:shadow-md">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold text-lg">{booking.serviceType} with {booking.serviceProviderName}</h3>
                              <p className="text-sm text-muted-foreground mt-1">Date: {booking.date} at {booking.time}</p>
                              <Badge variant="outline" className="mt-2 capitalize">{booking.status}</Badge>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={isDeleting === booking.id}
                            >
                              {isDeleting === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              <span className="ml-2 hidden sm:inline">Cancel</span>
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                       <Calendar className="mx-auto h-12 w-12 opacity-20 mb-2" />
                       <p>No active bookings.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Past & Completed</CardTitle>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <Skeleton className="h-24 w-full" />
                ) : pastBookings.length > 0 ? (
                    <ul className="space-y-4">
                      {pastBookings.map((booking) => (
                        <li key={booking.id} className="rounded-md border p-4 shadow-sm opacity-80">
                          <h3 className="font-semibold">{booking.serviceType} with {booking.serviceProviderName}</h3>
                          <p className="text-sm text-muted-foreground">Date: {booking.date} at {booking.time}</p>
                          <p className="text-sm text-green-600 flex items-center mt-2 font-medium">
                            <CheckCircle className="mr-1 h-4 w-4"/> {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <div className="py-12 text-center text-muted-foreground">
                        <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
                        <p>No history found.</p>
                     </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Calendar</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center p-0 sm:p-4">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border shadow w-full"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
