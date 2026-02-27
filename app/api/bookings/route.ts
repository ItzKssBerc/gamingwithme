import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format, add } from 'date-fns';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  try {
    if (username) {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const bookings = await prisma.booking.findMany({ where: { providerId: user.id } });
      return NextResponse.json(bookings);
    }
    const all = await prisma.booking.findMany({});
    return NextResponse.json(all);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { providerId, coachUsername, serviceId, date, time, customerId, gameId, price, duration, status } = body

    if (!providerId && coachUsername) {
      const u = await prisma.user.findUnique({ where: { username: coachUsername } })
      if (u) providerId = u.id
    }

    if (!providerId || !date || !time || !customerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Optional: validation/capacity logic...

    const start = new Date(date)
    const [sh, sm] = time.split(':').map((v: string) => Number(v))
    if (!isNaN(sh)) start.setHours(sh, sm || 0, 0, 0)

    const booking = await prisma.booking.create({
      data: {
        providerId,
        customerId,
        serviceId: serviceId || null,
        gameId: gameId || null,
        date: start,
        startTime: time,
        endTime: format(add(start, { minutes: Number(duration || 60) }), 'HH:mm'),
        duration: Number(duration || 60),
        price: Number(price || 0),
        status: status || 'confirmed'
      }
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create booking', detail: (e as any)?.message ?? String(e) }, { status: 500 })
  }
}
