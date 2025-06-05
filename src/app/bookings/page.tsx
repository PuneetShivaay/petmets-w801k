import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, CheckCircle, History, ListChecks } from "lucide-react";
import Link from "next/link";

export default function BookingManagementPage() {
  const upcomingBookings = [
    { id: 1, service: "Grooming with Happy Paws", date: "2024-08-15", time: "10:00 AM" },
    { id: 2, service: "Walk with Sarah M.", date: "2024-08-16", time: "04:00 PM" },
  ];
  const pastBookings = [
    { id: 3, service: "Training session with Alex P.", date: "2024-07-20", time: "02:00 PM", status: "Completed" },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Your Bookings"
        description="View, schedule, and manage all your pet service appointments in one place. Stay organized and never miss an appointment."
      >
        <Link href="/providers">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <CalendarPlus className="mr-2 h-4 w-4" /> Book New Service
          </Button>
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming"><ListChecks className="mr-2 h-4 w-4 inline-block" />Upcoming</TabsTrigger>
              <TabsTrigger value="past"><History className="mr-2 h-4 w-4 inline-block" />Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    <ul className="space-y-4">
                      {upcomingBookings.map((booking) => (
                        <li key={booking.id} className="rounded-md border p-4 shadow-sm">
                          <h3 className="font-semibold">{booking.service}</h3>
                          <p className="text-sm text-muted-foreground">Date: {booking.date} at {booking.time}</p>
                          <div className="mt-2">
                            <Button variant="outline" size="sm" className="mr-2">Reschedule</Button>
                            <Button variant="destructive" size="sm">Cancel</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No upcoming bookings.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="past">
              <Card>
                <CardHeader>
                  <CardTitle>Past Appointments</CardTitle>
                </CardHeader>
                <CardContent>
                {pastBookings.length > 0 ? (
                    <ul className="space-y-4">
                      {pastBookings.map((booking) => (
                        <li key={booking.id} className="rounded-md border p-4 shadow-sm">
                          <h3 className="font-semibold">{booking.service}</h3>
                          <p className="text-sm text-muted-foreground">Date: {booking.date} at {booking.time}</p>
                          <p className="text-sm text-green-600 flex items-center"><CheckCircle className="mr-1 h-4 w-4"/> {booking.status}</p>
                          <div className="mt-2">
                            <Button variant="outline" size="sm">Leave Review</Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                     <p className="text-muted-foreground">No past bookings.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Calendar
                mode="single"
                selected={new Date()}
                className="rounded-md border shadow"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
