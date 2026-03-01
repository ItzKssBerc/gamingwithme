"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Clock, User, ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"

interface Booking {
    id: string
    date: string
    startTime: string
    endTime: string
    status: string
    price: number
    customer?: { username: string }
    provider?: { username: string }
}

export default function MyBookingsPage() {
    const params = useParams()
    const router = useRouter()
    const username = params.username as string
    const { data: session } = useSession()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

    // Redirect if not the owner or authorized
    useEffect(() => {
        if (session && session.user.username !== username) {
            // Optional: restricted access check
        }
    }, [session, username])

    useEffect(() => {
        if (username) {
            fetchBookings()
        }
    }, [username])

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/bookings?username=${username}`)
            if (response.ok) {
                const data = await response.json()
                setBookings(data)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-white/5 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                    </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 animate-pulse font-mono">Loading History...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-transparent text-white selection:bg-primary/30 font-sans">
            <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-12">
                {/* Navigation */}
                <Link href="/profile" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-white transition-colors mb-12 group">
                    <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Navigate: Return to Profile
                </Link>

                {/* Page Header */}
                <div className="mb-20 border-b border-white/[0.05] pb-12">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="w-8 h-[2px] bg-primary"></span>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">History.Log // Authorized History</span>
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-6">
                        Booking <span className="text-white/20">History</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-lg">
                        History of all scheduled coaching sessions and upcoming bookings. Authorized log review in progress.
                    </p>
                </div>

                {bookings.length === 0 ? (
                    <div className="bg-white/[0.01] border border-white/5 rounded-[48px] p-24 text-center backdrop-blur-sm border-dashed">
                        <div className="group relative w-20 h-20 mx-auto mb-10">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                            <div className="relative w-full h-full bg-[#0a0a0a] border border-white/10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110">
                                <Calendar className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black tracking-tighter mb-4 uppercase">No Bookings Detected</h2>
                        <p className="text-gray-500 max-w-sm mx-auto mb-12 text-sm font-medium leading-relaxed">
                            Your booking history is currently empty. Complete your first coaching session to initialize the log.
                        </p>
                        <Link href="/gamers">
                            <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black h-12 px-10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                                Find a Coach
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking, index) => (
                            <div key={booking.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                                <Card className="relative overflow-hidden bg-[#0a0a0a] backdrop-blur-md border border-white/5 hover:border-primary/30 transition-all duration-300 rounded-2xl group">
                                    {/* HUD Accent */}
                                    <div className="absolute top-0 right-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-500"></div>

                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">BOOKING DATE</span>
                                                <div className="text-xl font-black tracking-tighter text-white">
                                                    {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 ${booking.status === 'confirmed' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    booking.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-white/5 text-gray-500'
                                                    }`}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-6 mb-8">
                                            <div className="flex items-center gap-4 group/item">
                                                <div className="p-2 bg-white/[0.03] border border-white/[0.05] rounded-xl group-hover/item:border-primary/30 transition-colors">
                                                    <Clock className="h-4 w-4 text-gray-600 group-hover/item:text-primary transition-colors" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Time Slot</span>
                                                    <span className="text-sm font-bold text-gray-300">{booking.startTime} - {booking.endTime}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 group/item">
                                                <div className="p-2 bg-white/[0.03] border border-white/[0.05] rounded-xl group-hover/item:border-primary/30 transition-colors">
                                                    <User className="h-4 w-4 text-gray-600 group-hover/item:text-primary transition-colors" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">Booking ID</span>
                                                    <span className="text-sm font-bold text-gray-300">BK-0{booking.id.slice(-4).toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600">SERVICE PRICE</span>
                                                <span className="text-2xl font-black text-white tracking-tighter">${booking.price}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 duration-500">
                                                <ShieldCheck className="w-3 h-3" />
                                                Secured
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
