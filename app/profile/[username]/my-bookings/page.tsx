"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, Clock, User, Gamepad2 } from "lucide-react"
import LoadingSync from "@/components/LoadingSync"


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
    const username = params.username as string
    const { data: session } = useSession()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)

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
        return <LoadingSync message="SYNC / ARCHIVE" subtext="Decrypting Booking History" />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-green-400" />
                        My Bookings
                    </h1>
                    <p className="text-gray-400 mt-2">Manage your gaming sessions</p>
                </div>

                {bookings.length === 0 ? (
                    <Card className="bg-white/5 border-white/10 max-w-2xl mx-auto mt-12">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="h-16 w-16 text-gray-500 mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">No Bookings Yet</h2>
                            <p className="text-gray-400 text-center">
                                You don't have any bookings at the moment.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => (
                            <Card key={booking.id} className="gaming-card">
                                <CardHeader className="pb-3 border-b border-white/10">
                                    <CardTitle className="text-lg text-white flex justify-between items-center">
                                        <span>{new Date(booking.date).toLocaleDateString()}</span>
                                        <span className="text-sm px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                            {booking.status}
                                        </span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="flex items-center text-gray-300 gap-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span>{booking.startTime} - {booking.endTime}</span>
                                    </div>
                                    {/* Note: In a full implementation, you'd fetch customer/provider details from the booking relation */}
                                    <div className="flex items-center text-gray-300 gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span>Booking ID: {booking.id.slice(-6)}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                                        <span className="text-gray-400 text-sm">Amount</span>
                                        <span className="text-green-400 font-bold">${booking.price}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
