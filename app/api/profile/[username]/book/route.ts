import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { providerId, gameId, date, startTime, endTime, price, notes } = await req.json();
    const customerId = session.user.id;

    if (!providerId || !gameId || !date || !startTime || !endTime || !price) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (providerId === customerId) {
        return NextResponse.json({ error: 'You cannot book a session with yourself.' }, { status: 400 });
    }

    try {
        const bookingDate = new Date(date);

        const newBooking = await prisma.booking.create({
            data: {
                providerId,
                customerId,
                gameId,
                date: bookingDate,
                startTime,
                endTime,
                duration: 60, // Assuming 1-hour slots
                price,
                notes,
                status: 'pending',
            },
        });

        return NextResponse.json(newBooking, { status: 201 });
    } catch (error) {
        console.error('Error creating booking:', error);
        return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
}
