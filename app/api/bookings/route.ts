
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const { providerId, serviceId, date, time, customerId, gameId, price, duration } = body

    if (!providerId || !serviceId || !date || !time || !customerId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Find service slot (per-date) if exists
    const slot = await prisma.serviceSlot.findFirst({ where: { serviceId, date, time } })

    // Use slot.capacity or fallback to weekly recurring slot capacity or service capacity
    let capacity = slot?.capacity ?? 0
    if (capacity === 0) {
      // check weekly recurring slot for this service matching dayOfWeek and time
      const d = new Date(date)
      const dow = d.getDay()
      const weekly = await prisma.weeklyServiceSlot.findFirst({ where: { serviceId, dayOfWeek: dow, time } })
      if (weekly) capacity = weekly.capacity ?? 0
    }
    if (capacity === 0) {
      const svc = await prisma.fixedService.findUnique({ where: { id: serviceId } })
      capacity = svc?.capacity ?? 1
    }

    // Count existing bookings for this provider/date/time
    const existingCount = await prisma.booking.count({ where: { providerId, date: new Date(date), startTime: time } })

    if (existingCount >= capacity) {
      return NextResponse.json({ error: 'Time slot is full' }, { status: 409 })
    }

    const start = new Date(date)
  const [sh, sm] = time.split(':').map((v: string) => Number(v))
    start.setHours(sh, sm, 0, 0)
  const end = new Date(start.getTime() + (Number(duration || 60) * 60000))

    const booking = await prisma.booking.create({ data: {
      providerId,
      customerId,
      gameId: gameId || null,
      date: start,
      startTime: time,
      endTime: end.toTimeString().slice(0,5),
  duration: Number(duration || 60),
      price: Number(price || 0),
      status: 'confirmed'
    }})

    return NextResponse.json(booking, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create booking', detail: (e as any)?.message ?? String(e) }, { status: 500 })
  }
}
