
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

// This type should ideally be shared from a common types file
type Booking = {
  id: string;
  serviceId: string;
  date: string;
  time: string;
  coachUsername: string;
  // For simplicity, we'll fetch service details separately if needed
  // In a real app, the API might return this data pre-joined.
};

export default function MyBookingsPage() {
  const params = useParams();
  const username = params.username as string;

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Fetch bookings for the current user (in this case, the profile being viewed)
        const response = await fetch(`/api/bookings?user=${username}`);
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const userBookings = await response.json();
        setBookings(userBookings);
      } catch (error) {
        console.error(error);
        // Handle error display in UI, e.g., with a toast
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [username]);

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-4xl mx-auto border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">My Bookings for {username}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : bookings.length > 0 ? (
            <ul className="space-y-4">
              {bookings.map((booking) => (
                <li key={booking.id} className="p-4 border bg-muted/50 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg capitalize">{booking.serviceId.replace(/-/g, ' ')}</h3>
                    <p className="text-sm text-muted-foreground">
                      with {booking.coachUsername} on {new Date(booking.date).toLocaleDateString()} at {booking.time}
                    </p>
                  </div>
                  <Avatar>
                    <AvatarImage src={`https://github.com/${booking.coachUsername}.png`} alt={booking.coachUsername} />
                    <AvatarFallback>{booking.coachUsername.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-muted-foreground py-8">You have no upcoming bookings.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
