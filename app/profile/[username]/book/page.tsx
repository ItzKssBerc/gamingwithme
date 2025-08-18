
"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import { format, parse } from "date-fns"
import { Calendar as CalendarIcon, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

export default function BookSessionPage() {
  const params = useParams();
  const { toast } = useToast();
  const username = params.username as string;

  const [coach, setCoach] = useState(null);
  const [services, setServices] = useState([]);
  const [availability, setAvailability] = useState({});
  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(false)

  const fetchCoachData = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/coaches/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch coach data');
      }
      const data = await response.json();
      const initialAvailability = data.availability || {};

      setCoach(data.coach);
      setServices(data.services || []);
      setAvailability(initialAvailability);
      
      if (data.services?.length > 0) {
        setSelectedService(data.services[0].id);
      }

      // Find the first available date from the data and set it as the initial date
      if (initialAvailability && Object.keys(initialAvailability).length > 0) {
        const availableDateStrings = Object.keys(initialAvailability).sort();
        const firstAvailableDateString = availableDateStrings[0];
        const firstAvailableDate = parse(firstAvailableDateString, 'yyyy-MM-dd', new Date());
        setDate(firstAvailableDate);
      } else {
        setDate(undefined);
      }

    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Could not load coach details." });
    } finally {
      setIsLoading(false);
    }
  }, [username, toast]);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchCoachData();
  }, [fetchCoachData]);

  // DERIVED STATE: availableTimes is now calculated automatically when date or availability changes.
  const availableTimes = useMemo(() => {
    if (!date || !availability) return [];
    const dateString = format(date, "yyyy-MM-dd");
    return availability[dateString] || [];
  }, [date, availability]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setSelectedTime(null); // Reset time when date changes
    setIsCalendarOpen(false); // Close the popover after selection
  };

  const handleBooking = async () => {
    if (!date || !selectedService || !selectedTime) return;
    
    setIsBookingLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachUsername: username,
          serviceId: selectedService,
          date: date.toISOString(),
          time: selectedTime,
          user: "currentUser" // Replace with actual logged-in user
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Booking failed');
      }

      toast({
        title: "Booking Successful!",
        description: `Your session with ${coach.name} on ${format(date, "PPP")} at ${selectedTime} is confirmed.`,
      });
      
      // Refresh all data to get the latest availability
      await fetchCoachData();
      setSelectedTime(null);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: error.message || "Could not book the session. Please try again.",
      })
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <div className="bg-muted/40 min-h-screen w-full flex items-center justify-center">
      {services.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center w-full">
          <User className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-center">No bookable services</h2>
          <p className="text-muted-foreground text-lg text-center max-w-md">
            This user has not created any services yet, so you cannot book a session.
          </p>
        </div>
      ) : (
        <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Column: Coach Profile */}
            <div className="md:col-span-1">
               {isLoading ? <Loader2 className="mx-auto h-12 w-12 animate-spin" /> : coach && (
                <div className="space-y-4 text-center md:text-left pt-8">
                    <Avatar className="h-28 w-28 mb-4 border-2 border-primary/20 mx-auto md:mx-0">
                      <AvatarImage src={coach.avatarUrl} alt={`@${coach.name}`} />
                      <AvatarFallback>
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="text-3xl font-bold tracking-tight">{coach.name}</h1>
                    <p className="text-muted-foreground">{coach.bio}</p>
                    <Separator className="my-6" />
                    <p className="text-sm text-muted-foreground">
                      {coach.longDescription}
                    </p>
                </div>
               )}
            </div>

            {/* Right Column: Booking Form or Warning */}
            <div className="md:col-span-2">
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <CardTitle className="tracking-tight">Schedule Your Session</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Complete the steps below to book your time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {isLoading ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : (
                    <>
                      {/* ...existing code... */}
                      <div className="space-y-4">
                        <h3 className="text-base font-semibold text-muted-foreground">1. Select a Service</h3>
                          <div className="grid grid-cols-1 gap-4">
                            {services.map((service) => (
                              <div
                                key={service.id}
                                className={cn(
                                  "rounded-lg border p-4 cursor-pointer transition-all flex justify-between items-center",
                                  selectedService === service.id
                                    ? "bg-muted border-primary/50"
                                    : "border-muted-foreground/20 hover:border-muted-foreground/50"
                                )}
                                onClick={() => setSelectedService(service.id)}
                              >
                                <div className="space-y-1">
                                  <h4 className="font-semibold">{service.name}</h4>
                                  <p className="text-sm text-muted-foreground">{service.description}</p>
                                </div>
                                <p className="text-lg font-semibold">{service.price}</p>
                              </div>
                            ))}
                          </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                          <h3 className="text-base font-semibold text-muted-foreground">2. Pick a Date & Time</h3>
                          <div className="flex w-full items-start space-x-4">
                            <div className="w-1/2">
                              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                  <PopoverTrigger asChild>
                                  <Button
                                      variant={"outline"}
                                      className={cn(
                                      "w-full justify-start text-left font-normal h-12 text-base",
                                      !date && "text-muted-foreground"
                                      )}
                                      disabled={!coach} // Disable if no coach data yet
                                  >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {date ? format(date, "PPP") : <span>Select a date</span>}
                                  </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                  <Calendar
                                      value={date}
                                      onChange={handleDateSelect}
                                  />
                                  </PopoverContent>
                              </Popover>
                            </div>
                            <div className="w-1/2">
                              <Select
                                  value={selectedTime || undefined}
                                  onValueChange={setSelectedTime}
                                  disabled={availableTimes.length === 0}
                              >
                                  <SelectTrigger className="w-full h-12 text-base">
                                      <SelectValue placeholder="Select a time..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {availableTimes.map(time => (
                                      <SelectItem key={time} value={time}>
                                          {time}
                                      </SelectItem>
                                      ))}
                                  </SelectContent>
                              </Select>
                              {availableTimes.length === 0 && !isLoading && (
                                  <p className="text-sm text-muted-foreground pt-2">No available times for this date.</p>
                              )}
                            </div>
                          </div>
                      </div>

                      <Button onClick={handleBooking} disabled={isBookingLoading || !date || !selectedService || !selectedTime} size="lg" className="w-full text-base py-6">
                        {isBookingLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          "Book Session"
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
