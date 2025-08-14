import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookerId = session.user.id
    const body = await req.json()
    const { 
        profileUserId, 
        bookingType, 
        message, 
        serviceId, 
        date, 
        time 
    } = body

    if (!profileUserId || !bookingType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (bookerId === profileUserId) {
        return NextResponse.json({ error: 'You cannot book a session with yourself.' }, { status: 400 })
    }

    let bookingData: any = {
        bookerId,
        profileUserId,
        status: 'PENDING', // Default status
        message,
        bookingType,
    }

    if (bookingType === 'service') {
        if (!serviceId) {
            return NextResponse.json({ error: 'Service ID is required for service booking' }, { status: 400 })
        }
        const service = await prisma.fixedService.findUnique({
            where: { id: serviceId }
        })
        if (!service || !service.isActive) {
            return NextResponse.json({ error: 'Selected service is not available' }, { status: 400 })
        }
        bookingData.serviceId = serviceId;
        bookingData.price = service.price;
        bookingData.duration = service.duration;

    } else if (bookingType === 'coaching') {
        if (!date || !time) {
            return NextResponse.json({ error: 'Date and time are required for coaching booking' }, { status: 400 })
        }
        // You might want to add more validation here, e.g., check if the slot is actually available
        bookingData.scheduledAt = new Date(`${date}T${time}`);

    } else {
        return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })
    }

    const newBooking = await prisma.booking.create({
      data: bookingData,
    })

    // TODO: Create a notification for the profile user

    return NextResponse.json(newBooking, { status: 201 })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 })
  }
}
