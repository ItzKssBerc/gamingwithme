"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { add, format, getDay, parse, startOfDay } from 'date-fns'
import { User, Loader2, AlertCircle, ArrowLeft } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  username: string
  avatarUrl?: string | null
  bio?: string | null
  longDescription?: string | null
  userGames: Array<{
    game: {
      id: string
      name: string
    }
  }>
  userAvailability: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
    price: number
    isActive: boolean
  }>
}

interface TimeSlot {
  start: Date
  end: Date
  price: number
  capacity?: number
  serviceId?: string
}

export default function BookSessionPage() {
  // helper: produce local YYYY-MM-DD (avoid toISOString timezone shifts)
  const localIso = (d?: Date) => {
    if (!d) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }
  const params = useParams();
  const { toast } = useToast();
  const username = params.username as string;
  const { data: sessionData } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(false)

  const fetchProfileData = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/coaches/${username}`);
      if (!response.ok) {
        throw new Error('Failed to fetch coach data');
      }
      const data = await response.json();
      // API returns { coach, services, availability }
      const mergedProfile = {
        ...data.coach,
        userGames: data.services || [],
        userAvailability: data.availability || [],
      }
      // build a slotsByDate map from services' serviceSlots if present
      const slotsByDate: Record<string, Array<{ time: string; capacity?: number }>> = {}
      if (Array.isArray(data.services)) {
        for (const svc of data.services) {
          if (!Array.isArray(svc.serviceSlots)) continue
          for (const ss of svc.serviceSlots) {
            const date = String(ss.date)
            if (!slotsByDate[date]) slotsByDate[date] = []
            slotsByDate[date].push({ time: ss.time, capacity: ss.capacity, serviceId: svc.id })
          }
        }
      }
      // attach to profile for client usage
      ;(mergedProfile as any).slotsByDate = slotsByDate
      setProfile(mergedProfile as unknown as UserProfile);

      // If there's no selected date yet, set it to the next available day
      if ((!selectedDate || selectedDate === undefined) && Array.isArray(data.availability) && data.availability.length > 0) {
        // find the next availability day starting from today
        const today = new Date()
        // sort availability by dayOfWeek (0-6)
        const days = data.availability.map((a: any) => a.dayOfWeek)
        // find the nearest upcoming date that matches any available dayOfWeek
        for (let i = 0; i < 14; i++) {
          const check = new Date()
          check.setDate(today.getDate() + i)
          const dow = getDay(check)
          if (days.includes(dow)) {
            setSelectedDate(check)
            break
          }
        }
      }
      // If no weekly availability, try to set selectedDate from per-service slots (slotsByDate)
      if ((!selectedDate || selectedDate === undefined) && (mergedProfile as any).slotsByDate) {
        const slotsMap = (mergedProfile as any).slotsByDate as Record<string, any[]>
        const keys = Object.keys(slotsMap)
        if (keys.length > 0) {
          // pick the earliest date key
          keys.sort()
          const firstIso = keys[0]
          const parts = firstIso.split('-').map((p: string) => Number(p))
          if (parts.length === 3) {
            const d = new Date(parts[0], parts[1] - 1, parts[2])
            setSelectedDate(d)
          }
        }
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
    fetchProfileData();
  }, [fetchProfileData]);

  useEffect(() => {
  if (profile && selectedDate) {
      const dayOfWeek = getDay(selectedDate)

      const availabilities = Array.isArray(profile.userAvailability)
        ? profile.userAvailability.filter(a => {
            const raw = Number(a.dayOfWeek)
            if (Number.isNaN(raw)) return false
            // Normalize incoming dayOfWeek to 0-6 (API might use 0-6 or 1-7 where 1=Mon..7=Sun)
            const normalized = raw % 7 // 7 -> 0 (Sunday), 1->1 (Monday), 0->0 (Sunday)
            return a.isActive && normalized === dayOfWeek
          })
        : []

      // debug: log availability count for selected day
      if (process.env.NODE_ENV !== 'production') {
        console.debug('Booking page: selectedDate', selectedDate, 'dayOfWeek', dayOfWeek, 'availabilitiesForDay', availabilities)
      }

  const slots: TimeSlot[] = []

  for (const a of availabilities) {
        // parse times robustly by splitting to avoid format mismatches like "9:00" vs "09:00"
        const [sh, sm] = (a.startTime || '').split(':').map((v: string) => Number(v))
        const [eh, em] = (a.endTime || '').split(':').map((v: string) => Number(v))

        if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) continue

        let startTime = new Date(selectedDate)
        startTime.setHours(sh, sm, 0, 0)
        const endTime = new Date(selectedDate)
        endTime.setHours(eh, em, 0, 0)

        // guard: if end is before or equal to start, skip
        if (endTime.getTime() <= startTime.getTime()) continue

        // generate 60-minute slots (base slot duration)
          while (startTime.getTime() < endTime.getTime()) {
          const slotEnd = add(startTime, { minutes: 60 })
          // don't push a slot that exceeds endTime
          if (slotEnd.getTime() > endTime.getTime()) break
          // userAvailability slots are not tied to a service; leave serviceId undefined and capacity default
          slots.push({ start: new Date(startTime), end: slotEnd, price: a.price, capacity: a.isActive ? (a.price ? 1 : 1) : 1 })
          startTime = add(startTime, { minutes: 60 })
        }
      }
      if (slots.length > 0) {
        setAvailableTimes(slots)
      } else {
            // fallback to per-service slots by exact date (YYYY-MM-DD)
        if (selectedDate) {
          const iso = localIso(selectedDate)
          const slotsMap = (profile as any).slotsByDate || {}
          const daySlots = slotsMap[iso] || []
          if (daySlots.length > 0) {
            const parsed: TimeSlot[] = daySlots.map((s: any) => {
              const [h, m] = (s.time || '').split(':').map((v:string) => Number(v))
              const st = new Date(selectedDate!.getTime()); st.setHours(h||0, m||0, 0, 0)
              return { start: st, end: add(st, { minutes: 60 }), price: 0, capacity: s.capacity, serviceId: s.serviceId }
            })
            setAvailableTimes(parsed)
          } else {
            // No per-date slots: check weekly recurring slots from services
            const dow = getDay(selectedDate)
            const weeklyTimes: Array<{ time: string; capacity?: number; serviceId?: string }> = []
            if (Array.isArray((profile as any).userGames)) {
              for (const svc of (profile as any).userGames) {
                if (!Array.isArray(svc.weeklyServiceSlots)) continue
                for (const ws of svc.weeklyServiceSlots) {
                  if (Number(ws.dayOfWeek) === dow) weeklyTimes.push({ time: ws.time, capacity: ws.capacity, serviceId: svc.id })
                }
              }
            }
            if (weeklyTimes.length > 0) {
              const parsed: TimeSlot[] = weeklyTimes.map((s: any) => {
                const [h, m] = (s.time || '').split(':').map((v:string) => Number(v))
                const st = new Date(selectedDate!.getTime()); st.setHours(h||0, m||0, 0, 0)
                return { start: st, end: add(st, { minutes: 60 }), price: 0, capacity: s.capacity, serviceId: s.serviceId }
              })
              setAvailableTimes(parsed)
            } else {
              setAvailableTimes([])
            }
          }
        } else {
          setAvailableTimes([])
        }
      }
    }
    else {
      // No profile or no availability for selected date
      // try fallback: per-service slots by exact date (YYYY-MM-DD)
  if (!selectedDate) { setAvailableTimes([]); return }
  const iso = localIso(selectedDate)
      const slotsMap = (profile as any).slotsByDate || {}
      const daySlots = slotsMap[iso] || []
      if (daySlots.length > 0) {
        const parsed: TimeSlot[] = daySlots.map((s: any) => {
          const [h, m] = (s.time || '').split(':').map((v:string) => Number(v))
          const st = new Date(selectedDate!.getTime()); st.setHours(h||0, m||0, 0, 0)
          return { start: st, end: add(st, { minutes: 30 }), price: 0 }
        })
        setAvailableTimes(parsed)
      } else {
        setAvailableTimes([])
      }
    }
  }, [profile, selectedDate])

  // auto-select first available time when slots change
  useEffect(() => {
    if (availableTimes.length > 0) {
      setSelectedTime(availableTimes[0].start.toISOString())
    } else {
      setSelectedTime(null)
    }
  }, [availableTimes])

  // Fetch bookings count for the selected slot and compute capacity info
  const [slotSignupCount, setSlotSignupCount] = useState<number | null>(null)
  const [slotCapacity, setSlotCapacity] = useState<number | null>(null)

  useEffect(() => {
    const loadCounts = async () => {
      if (!profile || !selectedDate || !selectedTime) { setSlotSignupCount(null); setSlotCapacity(null); return }
      // find the slot object
      const slotObj = availableTimes.find(s => s.start.toISOString() === selectedTime)
      const capacity = slotObj?.capacity ?? null
      setSlotCapacity(capacity)

      try {
        const username = profile.username
        const resp = await fetch(`/api/bookings?username=${encodeURIComponent(username)}`)
        if (!resp.ok) { setSlotSignupCount(null); return }
        const bookings = await resp.json()
        const iso = localIso(selectedDate)
        // bookings store date as ISO DateTime; compare by date and startTime
        const matching = (bookings || []).filter((b: any) => {
          const bDate = new Date(b.date)
          const bIso = localIso(bDate)
          return bIso === iso && (b.startTime || b.start_time || b.start) === (slotObj ? slotObj.start.toTimeString().slice(0,5) : '')
        })
        setSlotSignupCount(matching.length)
      } catch (e) {
        setSlotSignupCount(null)
      }
    }
    loadCounts()
  }, [profile, selectedDate, selectedTime, availableTimes])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return
    setSelectedDate(date)
    setSelectedTime(null)
    setIsCalendarOpen(false)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;
    
    setIsBookingLoading(true);
    try {
      // selectedTime is an ISO string representing the slot start
      const start = new Date(selectedTime)
      // find the matching slot to get price and end
      const slot = availableTimes.find(s => s.start.toISOString() === selectedTime)
      const end = slot ? slot.end : add(start, { minutes: 30 })
      const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachUsername: username,
          date: selectedDate.toISOString(),
          startTime: start.toTimeString().slice(0,5),
          endTime: end.toTimeString().slice(0,5),
          duration,
          price: slot?.price ?? 0,
          userId: sessionData?.user?.id // Use the actual logged-in user ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Booking failed');
      }

      toast({
        title: "Booking Successful!",
        description: `Your session with ${profile?.username} on ${format(selectedDate, "PPP")} at ${selectedTime} is confirmed.`,
      });
      
      // Refresh profile data to get the latest availability
      await fetchProfileData();
      setSelectedTime(null);

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: msg || "Could not book the session. Please try again.",
      })
    } finally {
      setIsBookingLoading(false);
    }
  };

  return (
    <div className="bg-muted/40 min-h-screen w-full flex items-center justify-center">
      {isLoading ? (
        <Loader2 className="mx-auto h-12 w-12 animate-spin" />
      ) : profile ? (
        <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Left Column: Coach Profile */}
            <div className="md:col-span-1">
              
                <div className="space-y-4 text-center md:text-left pt-8">
                    <Avatar className="h-28 w-28 mb-4 border-2 border-primary/20 mx-auto md:mx-0">
                      <AvatarImage src={profile.avatarUrl || undefined} alt={`@${profile.username}`} />
                      <AvatarFallback>
                        <User className="h-12 w-12" />
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="text-3xl font-bold tracking-tight">{profile.username}</h1>
                    <p className="text-muted-foreground">{profile.bio}</p>
                    <Separator className="my-6" />
                    <p className="text-sm text-muted-foreground">
                      {profile.longDescription}
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
                  {isLoading ? <Loader2 className="mx-auto h-8 w-8 animate-spin" /> : (
                    <>
                      <div className="space-y-4">
                        <h3 className="text-base font-semibold text-muted-foreground">1. Select a Date</h3>
                        <div>
                          <Calendar
                            value={selectedDate}
                            onChange={handleDateSelect}
                            className="rounded-md border border-white/20 bg-white/5"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                          <h3 className="text-base font-semibold text-muted-foreground">2. Pick a Time</h3>
                          <Select
                    value={selectedTime || undefined}
                    onValueChange={setSelectedTime}
                    disabled={availableTimes.length === 0}
                          >
                              <SelectTrigger className="w-full h-12 text-base">
                                  <SelectValue placeholder="Select a time..." />
                              </SelectTrigger>
                              <SelectContent>
                      {availableTimes.map(timeSlot => (
                      <SelectItem key={timeSlot.start.toISOString()} value={timeSlot.start.toISOString()}>
                        {format(timeSlot.start, 'HH:mm')}
                      </SelectItem>
                      ))}
                              </SelectContent>
                          </Select>
                          {availableTimes.length === 0 && !isLoading && (
                              <p className="text-sm text-muted-foreground pt-2">No available times for this date.</p>
                          )}
                          {/* Capacity info */}
                          {selectedTime && (
                            <div className="mt-2 text-sm text-green-200/80">
                              <div>{selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} — booked: {slotSignupCount ?? '–'} / capacity: {slotCapacity ?? '–'}</div>
                            </div>
                          )}
                           {/* Debug info for availability */}
                           <div className="mt-2 text-xs text-slate-400">
                             <div>Debug: selectedDate: {selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '—'}</div>
                             <div>availableTimes: {availableTimes.length}</div>
                             <div>fallbackSlots: {(profile && (profile as any).slotsByDate && selectedDate) ? (((profile as any).slotsByDate[localIso(selectedDate)]||[]).length) : 0}</div>
                             <div>slotsByDate keys: {(profile && (profile as any).slotsByDate) ? Object.keys((profile as any).slotsByDate).join(', ') : '—'}</div>
                           </div>
                      </div>

                      <Button onClick={handleBooking} disabled={isBookingLoading || !selectedDate || !selectedTime} size="lg" className="w-full text-base py-6">
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
      ) : (
        <div className="flex flex-col items-center justify-center w-full p-4">
          <Card className="max-w-md w-full mx-auto border-red-500/20 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-red-400" />Coach Not Found</CardTitle>
              <CardDescription>We could not find the coach you are looking for. Please check the username or try again later.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
