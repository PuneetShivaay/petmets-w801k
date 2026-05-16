
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
import { CalendarPlus, History, ListChecks, Loader2, Trash2, CheckCircle2, Clock } from "lucide-react";
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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

  // Get current date in YYYY-MM-DD format for filtering
  const todayStr = new Date().toISOString().split('T')[0];
  
  const upcomingBookings = bookings.filter(b => b.date >= todayStr && b.status !== 'cancelled' && b.status !== 'completed');
  const pastBookings = bookings.filter(b => b.date < todayStr || b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold font-headline">My Appointments</h2>
          <p className="text-muted-foreground">View and manage all your pet service bookings in one place.</p>
        </div>
        {userRole === 'owner' && (
          <Link href="/providers">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              <CalendarPlus className="mr-2 h-4 w-4" /> Book New Service
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main List Section */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="upcoming" className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                <span>Upcoming</span>
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="mt-0">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Active Appointments
                  </CardTitle>
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
                        <li key={booking.id} className="rounded-xl border bg-card p-4 transition-all hover:shadow-md">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg">{booking.serviceType}</h3>
                              <p className="text-sm font-medium text-muted-foreground">
                                with {booking.serviceProviderName}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                  {booking.date}
                                </Badge>
                                <Badge variant="outline" className="text-muted-foreground font-normal">
                                  {booking.time}
                                </Badge>
                                <Badge variant="outline" className="capitalize">
                                  {booking.status}
                                </Badge>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                              onClick={() => handleCancelBooking(booking.id)}
                              disabled={isDeleting === booking.id}
                            >
                              {isDeleting === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              <span className="ml-2">Cancel Booking</span>
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                       <CalendarPlus className="mx-auto h-12 w-12 opacity-20 mb-4" />
                       <p className="font-medium">No upcoming bookings scheduled.</p>
                       <p className="text-xs mt-1">Start by finding a professional service provider.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="past" className="mt-0">
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Past Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <Skeleton className="h-24 w-full" />
                ) : pastBookings.length > 0 ? (
                    <ul className="space-y-4">
                      {pastBookings.map((booking) => (
                        <li key={booking.id} className="rounded-xl border bg-muted/5 p-4 opacity-80">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{booking.serviceType}</h3>
                              <p className="text-sm text-muted-foreground">with {booking.serviceProviderName}</p>
                              <p className="text-xs text-muted-foreground">{booking.date} at {booking.time}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {booking.status === 'completed' ? (
                                <Badge className="bg-green-500/10 text-green-600 border-none">
                                  <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-muted-foreground">
                                  Cancelled
                                </Badge>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <div className="py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                        <History className="mx-auto h-12 w-12 opacity-20 mb-4" />
                        <p className="font-medium">No past appointments found.</p>
                     </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Calendar Section */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-primary/10 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-primary" />
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center">
              <div className="w-full max-w-[300px] sm:max-w-none flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-none"
                  showOutsideDays={false}
                />
              </div>
              <div className="mt-6 w-full space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Today's Summary</h4>
                <div className="p-4 rounded-xl bg-muted/30 border border-muted flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {upcomingBookings.filter(b => b.date === todayStr).length}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Today's Appointments</p>
                    <p className="text-xs text-muted-foreground">Don't forget to check your schedule!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
