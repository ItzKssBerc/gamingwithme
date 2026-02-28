"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { format, getDay, add } from 'date-fns'
import {
  User, Loader2, AlertCircle, ArrowLeft, Calendar as CalendarIcon,
  Clock, CheckCircle2, ShieldCheck, Zap, Info, CreditCard,
  Target, Award, Users, Star, ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface UserProfile {
  id: string
  username: string
  avatarUrl?: string | null
  bio?: string | null
  longDescription?: string | null
  userGames: Array<{
    id: string
    title?: string
    price: number
    game: { id: string; name: string }
    weeklyServiceSlots?: Array<{ dayOfWeek: number; time: string; capacity: number }>
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
  serviceTitle?: string
}

export default function BookSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const username = params.username as string;
  const { data: sessionData } = useSession();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableTimes, setAvailableTimes] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingLoading, setIsBookingLoading] = useState(false)

  const localIso = (d?: Date) => {
    if (!d) return ''
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  const fetchProfileData = useCallback(async () => {
    if (!username) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/coaches/${username}`);
      if (!response.ok) throw new Error('Coach not found');
      const data = await response.json();

      const mergedProfile = {
        ...data.coach,
        userGames: data.services || [],
        userAvailability: data.availability || [],
        slotsByDate: {} as Record<string, any[]>
      }

      if (Array.isArray(data.services)) {
        for (const svc of data.services) {
          if (!svc.serviceSlots) continue
          for (const ss of svc.serviceSlots) {
            const dateStr = String(ss.date)
            if (!mergedProfile.slotsByDate[dateStr]) mergedProfile.slotsByDate[dateStr] = []
            mergedProfile.slotsByDate[dateStr].push({ ...ss, serviceId: svc.id, serviceTitle: svc.title, price: svc.price })
          }
        }
      }

      setProfile(mergedProfile);
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Coach profile not available." });
    } finally {
      setIsLoading(false);
    }
  }, [username, toast]);

  useEffect(() => { fetchProfileData() }, [fetchProfileData]);

  useEffect(() => {
    if (!profile || !selectedDate) {
      setAvailableTimes([]);
      return;
    }

    const iso = localIso(selectedDate)
    const dow = getDay(selectedDate)
    const slots: TimeSlot[] = []

    const dateSlots = (profile as any).slotsByDate[iso] || []
    if (dateSlots.length > 0) {
      for (const ds of dateSlots) {
        const [h, m] = ds.time.split(':').map(Number)
        const st = new Date(selectedDate); st.setHours(h, m, 0, 0)
        slots.push({
          start: st,
          end: add(st, { minutes: 60 }),
          price: ds.price || 0,
          capacity: ds.capacity,
          serviceId: ds.serviceId,
          serviceTitle: ds.serviceTitle
        })
      }
    }

    if (Array.isArray(profile.userGames)) {
      for (const svc of (profile as any).userGames) {
        if (!svc.weeklyServiceSlots) continue
        for (const ws of svc.weeklyServiceSlots) {
          if (ws.dayOfWeek === dow) {
            const [h, m] = ws.time.split(':').map(Number)
            const st = new Date(selectedDate); st.setHours(h, m, 0, 0)
            if (!slots.some(s => s.start.getTime() === st.getTime())) {
              slots.push({
                start: st,
                end: add(st, { minutes: 60 }),
                price: svc.price,
                capacity: ws.capacity,
                serviceId: svc.id,
                serviceTitle: svc.title
              })
            }
          }
        }
      }
    }

    const generalAvail = profile.userAvailability.filter(a => a.isActive && a.dayOfWeek === dow)
    for (const a of generalAvail) {
      const [sh, sm] = a.startTime.split(':').map(Number)
      const [eh, em] = a.endTime.split(':').map(Number)
      let curr = new Date(selectedDate); curr.setHours(sh, sm, 0, 0)
      const end = new Date(selectedDate); end.setHours(eh, em, 0, 0)
      while (curr.getTime() < end.getTime()) {
        if (!slots.some(s => s.start.getTime() === curr.getTime())) {
          slots.push({ start: new Date(curr), end: add(curr, { minutes: 60 }), price: a.price, capacity: 1 })
        }
        curr = add(curr, { minutes: 60 })
      }
    }

    setAvailableTimes(slots.sort((a, b) => a.start.getTime() - b.start.getTime()))
  }, [profile, selectedDate]);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !profile) return;
    setIsBookingLoading(true);
    try {
      const slot = availableTimes.find(s => s.start.toISOString() === selectedTime)
      if (!slot) throw new Error("Invalid time slot selected")

      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachUsername: username,
          serviceId: slot.serviceId,
          date: slot.start.toISOString(),
          time: format(slot.start, 'HH:mm'),
          duration: 60,
          price: slot.price,
          status: slot.price > 0 ? 'pending_payment' : 'confirmed',
          customerId: sessionData?.user?.id
        }),
      });

      if (!bookingRes.ok) throw new Error(await bookingRes.text());
      const booking = await bookingRes.json();

      if (slot.price > 0) {
        const checkoutRes = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            coachUsername: username,
            bookingId: booking.id,
            price: slot.price,
            serviceTitle: slot.serviceTitle || "Coaching Session"
          })
        })

        if (!checkoutRes.ok) throw new Error("Failed to initialize payment");
        const { url } = await checkoutRes.json();
        window.location.href = url;
        return;
      }

      toast({ title: "Booking Confirmed!", description: `Success! See you on ${format(slot.start, 'PPP')} at ${format(slot.start, 'HH:mm')}.` });
      router.push('/profile/bookings')
    } catch (e) {
      toast({ variant: "destructive", title: "Booking Failed", description: (e as any).message });
    } finally {
      setIsBookingLoading(false);
    }
  };

  const currentSlot = availableTimes.find(s => s.start.toISOString() === selectedTime)

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-10 h-10 border-2 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em]">Syncing</p>
      </motion.div>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full p-6 bg-white/[0.02] border border-white/5 rounded-3xl text-center backdrop-blur-xl"
      >
        <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black mb-2 tracking-tight">Profile Offline</h2>
        <p className="text-xs text-gray-500 mb-6 font-medium">This coach is currently not reachable.</p>
        <Button onClick={() => router.back()} className="w-full h-10 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl">Back</Button>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-green-500/30 overflow-x-hidden">
      {/* Darkened Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.02),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Compact Header */}
        <div className="py-6 flex items-center justify-between border-b border-white/[0.02] mb-8">
          <button onClick={() => router.back()} className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
            Coaching <span className="text-green-500/30">Interface</span> v2.2
          </div>
        </div>

        {/* COMPACT HERO */}
        <div className="py-2 mb-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
              <Avatar className="h-28 w-28 border border-white/[0.05] p-1 bg-black">
                <AvatarImage src={profile.avatarUrl || undefined} className="rounded-full object-cover" />
                <AvatarFallback className="bg-slate-900 text-2xl font-black text-green-500">
                  {profile.username.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-[#020205] p-1.5 rounded-full border border-white/[0.05]">
                <CheckCircle2 className="w-4 h-4 text-green-500/50" />
              </div>
            </motion.div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                <h1 className="text-3xl md:text-5xl font-black tracking-tight underline transition-all hover:decoration-green-500/30 decoration-transparent underline-offset-8">
                  {profile.username}
                </h1>
              </div>
              <p className="text-sm text-gray-400 max-w-xl font-medium leading-relaxed italic">
                {profile.bio || "No profile description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN INTERFACE - DENSE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">

          {/* LEFT: MINIMAL CARDS */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#070707]/90 border border-white/[0.05] rounded-3xl p-6 backdrop-blur-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">Expertise</h3>
              <div className="space-y-4">
                {[
                  { icon: Target, text: "Match Analysis" },
                  { icon: Award, text: "Pro Tactics" },
                  { icon: Users, text: "Teamwork" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NEW: WEEKLY SCHEDULE SUMMARY */}
            <div className="bg-[#070707]/90 border border-white/[0.05] rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Weekly Schedule</h3>
                <CalendarIcon className="w-3 h-3 text-gray-700" />
              </div>
              <div className="space-y-3">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                  const dayIndex = i + 1 > 6 ? 0 : i + 1; // Convert to 0-indexed where 0 is Sunday
                  const dayAvail = profile.userAvailability.filter(a => a.dayOfWeek === dayIndex && a.isActive);
                  return (
                    <div key={day} className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-600 uppercase w-8">{day}</span>
                      <div className="flex-1 flex flex-col items-end gap-1">
                        {dayAvail.length > 0 ? (
                          dayAvail.map((a, idx) => (
                            <span key={idx} className="text-[10px] font-bold text-gray-400">
                              {a.startTime} - {a.endTime}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-black text-gray-800 uppercase italic">Offline</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT: COMPACT SCHEDULER */}
          <div className="lg:col-span-8">
            <div className="bg-[#070707]/90 border border-white/[0.05] rounded-[32px] overflow-hidden backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Compact Calendar Side */}
                <div className="p-8 border-b md:border-b-0 md:border-r border-white/[0.02]">
                  <div className="flex items-center gap-3 mb-8">
                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Section 01 / Date</h2>
                  </div>

                  <div className="flex justify-center">
                    <Calendar
                      value={selectedDate}
                      onChange={(date: Date) => { setSelectedDate(date); setSelectedTime(null); }}
                      className="scale-95 translate-y-[-10px]"
                    />
                  </div>
                </div>

                {/* Dense Slots Side */}
                <div className="p-8 bg-black/10">
                  <div className="flex items-center gap-3 mb-8">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Section 02 / Time</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {availableTimes.length > 0 ? (
                        availableTimes.map((slot, i) => {
                          const iso = slot.start.toISOString()
                          const isActive = selectedTime === iso
                          return (
                            <motion.button
                              key={iso}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.02 }}
                              onClick={() => setSelectedTime(iso)}
                              className={`
                                                        px-4 py-3 rounded-xl border text-[11px] font-bold tracking-tight text-center transition-all
                                                        ${isActive
                                  ? 'bg-green-600 border-green-500 text-black'
                                  : 'bg-black/40 border-white/[0.05] text-gray-400 hover:border-white/20 hover:text-white'}
                                                    `}
                            >
                              {format(slot.start, 'HH:mm')}
                            </motion.button>
                          )
                        })
                      ) : (
                        <div className="col-span-full py-20 text-center opacity-40">
                          <Info className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-300">No Windows Found</div>
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Integrated Footer Summary */}
              <div className="px-8 py-6 border-t border-white/[0.05] bg-black">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    {selectedDate && selectedTime ? (
                      <div className="flex flex-col gap-1">
                        <div className="text-xs font-black text-gray-300 flex items-center gap-2">
                          <CalendarIcon className="w-3 h-3 text-green-500/50" />
                          {format(selectedDate, 'MMM do')} @ {format(new Date(selectedTime), 'HH:mm')}
                        </div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">
                          Session payload: {currentSlot?.serviceTitle || "Coaching"}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-600">
                        Session Details Pending
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-0.5">Total Compensation</div>
                      <div className="text-2xl font-black text-gray-200 leading-none flex items-baseline gap-0.5">
                        <span className="text-green-500/50 text-base">$</span>
                        {currentSlot?.price || 0}
                      </div>
                    </div>

                    <Button
                      onClick={handleBooking}
                      disabled={isBookingLoading || !selectedTime}
                      className="h-12 px-10 bg-green-600/80 hover:bg-green-500 text-black font-black text-[11px] uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:grayscale disabled:opacity-10"
                    >
                      {isBookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Book Session"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-10 py-8 opacity-20 hover:opacity-100 transition-all duration-1000">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Secure Node</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">Endorsed by community</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
