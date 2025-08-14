"use client"

import "react-day-picker/dist/style.css";
import { useState } from "react"
import { format } from "date-fns"
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
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const coachUsername = "Bercel2";

const services = [
  {
    id: "1-hour-coaching",
    name: "1 Hour Coaching",
    description: "Personalized one-on-one coaching.",
    price: "$50",
  },
  {
    id: "full-match-review",
    name: "Full Match Review",
    description: "In-depth analysis of one of your matches.",
    price: "$75",
  },
];

export default function BookSessionPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedService, setSelectedService] = useState<string>(services[0].id)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleBooking = async () => {
    setIsLoading(true);
    console.log({
      coach: coachUsername,
      service: selectedService,
      date: date,
    });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Left Column: Coach Profile */}
          <div className="md:col-span-1">
            <div className="space-y-4 text-center md:text-left pt-8">
                <Avatar className="h-28 w-28 mb-4 border-2 border-primary/20 mx-auto md:mx-0">
                  <AvatarImage src={`https://github.com/${coachUsername}.png`} alt={`@${coachUsername}`} />
                  <AvatarFallback>
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <h1 className="text-3xl font-bold tracking-tight">{coachUsername}</h1>
                <p className="text-muted-foreground">Pro Valorant Coach</p>
                <Separator className="my-6" />
                <p className="text-sm text-muted-foreground">
                  Helping you climb the ranks with personalized coaching sessions and in-depth VOD reviews.
                </p>
            </div>
          </div>

          {/* Right Column: Booking Form */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="tracking-tight">Schedule Your Session</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Complete the steps below to book your time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Step 1: Select Service */}
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

                {/* Step 2: Select Date */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-muted-foreground">2. Pick a Date & Time</h3>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal h-12 text-base",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Select a date for your session</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Button onClick={handleBooking} disabled={isLoading || !date} size="lg" className="w-full text-base py-6">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    "Book Session"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
