
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, History, ListChecks, Loader2, Trash2, CheckCircle2, Clock, Check, X, PlayCircle } from "lucide-react";
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
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
}

export default function BookingManagementPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (!user || !userRole) return;

    const fieldToFilter = userRole === 'provider' ? 'serviceProviderId' : 'ownerId';
    // Removed orderBy to avoid composite index error
    const q = query(
      collection(db, "bookings"),
      where(fieldToFilter, "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      // Sort client-side by date
      data.sort((a, b) => a.date.localeCompare(b.date));
      setBookings(data);
      setLoading(false);
    }, (error) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: 'bookings',
        operation: 'list'
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userRole]);

  const handleUpdateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    if (!user) return;
    setIsUpdating(bookingId);
    
    const bookingRef = doc(db, "bookings", bookingId);
    const updateData = { status: newStatus, updatedAt: serverTimestamp() };

    updateDoc(bookingRef, updateData)
      .then(() => {
        toast({ title: "Booking Updated", description: `Appointment has been marked as ${newStatus}.` });
      })
      .catch(async (error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: bookingRef.path,
          operation: 'update',
          requestResourceData: updateData,
        }));
      })
      .finally(() => {
        setIsUpdating(null);
      });
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!user) return;
    setIsUpdating(bookingId);
    try {
      await deleteDoc(doc(db, "bookings", bookingId));
      toast({ title: "Booking Removed", description: "The appointment record has been deleted." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not remove the record." });
    } finally {
      setIsUpdating(null);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  
  const upcomingBookings = bookings.filter(b => (b.date >= todayStr || b.status === 'accepted') && b.status !== 'completed' && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => b.date < todayStr || b.status === 'completed' || b.status === 'cancelled');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted': return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Accepted</Badge>;
      case 'completed': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled': return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold font-headline">
            {userRole === 'provider' ? 'Service Schedule' : 'My Appointments'}
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'provider' ? 'Manage incoming requests and active sessions.' : 'View and manage your upcoming pet services.'}
          </p>
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
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">{booking.serviceType}</h3>
                                {getStatusBadge(booking.status)}
                              </div>
                              <p className="text-sm font-medium text-muted-foreground">
                                {userRole === 'provider' ? 'Request from Pet Owner' : `with ${booking.serviceProviderName}`}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 pt-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                  {booking.date}
                                </Badge>
                                <Badge variant="outline" className="text-muted-foreground font-normal">
                                  {booking.time}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                              {userRole === 'provider' && booking.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                                    onClick={() => handleUpdateStatus(booking.id, 'accepted')}
                                    disabled={isUpdating === booking.id}
                                  >
                                    <Check className="h-4 w-4 mr-1" /> Accept
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-destructive border-destructive/20 hover:bg-destructive/10 flex-1 sm:flex-none"
                                    onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                    disabled={isUpdating === booking.id}
                                  >
                                    <X className="h-4 w-4 mr-1" /> Decline
                                  </Button>
                                </>
                              )}
                              
                              {userRole === 'provider' && booking.status === 'accepted' && (
                                <Button 
                                  size="sm" 
                                  className="bg-primary text-primary-foreground flex-1 sm:flex-none"
                                  onClick={() => handleUpdateStatus(booking.id, 'completed')}
                                  disabled={isUpdating === booking.id}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" /> Complete Session
                                </Button>
                              )}

                              {userRole === 'owner' && booking.status === 'pending' && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full sm:w-auto"
                                  onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                                  disabled={isUpdating === booking.id}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" /> Cancel Request
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                       <CalendarPlus className="mx-auto h-12 w-12 opacity-20 mb-4" />
                       <p className="font-medium">No active appointments.</p>
                       <p className="text-xs mt-1">
                         {userRole === 'owner' ? 'Start by finding a professional service provider.' : 'Check back later for new customer requests.'}
                       </p>
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
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{booking.serviceType}</h3>
                              <p className="text-sm text-muted-foreground">
                                {userRole === 'provider' ? 'Session with Owner' : `with ${booking.serviceProviderName}`}
                              </p>
                              <p className="text-xs text-muted-foreground">{booking.date} at {booking.time}</p>
                            </div>
                            <div className="flex items-center gap-2">
                               {getStatusBadge(booking.status)}
                               <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDeleteBooking(booking.id)}
                                  disabled={isUpdating === booking.id}
                               >
                                 <Trash2 className="h-4 w-4" />
                               </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <div className="py-16 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                        <History className="mx-auto h-12 w-12 opacity-20 mb-4" />
                        <p className="font-medium">No history records found.</p>
                     </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

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
                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {userRole === 'provider' ? 'My Daily Load' : "Today's Summary"}
                </h4>
                <div className="p-4 rounded-xl bg-muted/30 border border-muted flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {upcomingBookings.filter(b => b.date === todayStr).length}
                  </div>
                  <div>
                    <p className="text-sm font-bold">Today's Jobs</p>
                    <p className="text-xs text-muted-foreground">Keep up the great work!</p>
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
