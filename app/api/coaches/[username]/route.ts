
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { username: string } }) {
  const { username } = params;
  try {
    // Find coach by username
    const coach = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        bio: true,
        avatar: true,
        isAdmin: true,
        isActive: true,
        createdAt: true,
        // Add more fields if needed
      }
    });
    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // Get services for this coach
    const services = await prisma.fixedService.findMany({
      where: { providerId: coach.id },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        isActive: true,
        createdAt: true,
        serviceSlots: {
          select: {
            id: true,
            date: true,
            time: true,
            capacity: true,
          }
        }
      }
    });

    // Get availability for this coach
    const availabilityRecords = await prisma.userAvailability.findMany({
      where: { userId: coach.id },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        price: true,
        isActive: true,
      }
    });

    return NextResponse.json({ coach, services, availability: availabilityRecords });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
