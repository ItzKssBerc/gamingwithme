import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { serviceId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { serviceId } = params;

  try {
    const service = await prisma.fixedService.findUnique({
      where: { id: serviceId },
      select: {
        title: true,
        description: true,
        providerId: true,
      },
    });

    if (!service || service.providerId !== session.user.id) {
      return NextResponse.json({ error: 'Service not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
