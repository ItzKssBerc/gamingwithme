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
    const requests = await prisma.serviceRequest.findMany({
      where: {
        serviceId: serviceId,
        service: {
          providerId: session.user.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedRequests = requests.map(req => ({
      id: req.id,
      userId: req.user.id,
      userName: req.user.username,
      userAvatar: req.user.avatar,
      status: req.status,
      createdAt: req.createdAt.toISOString(),
      message: req.message,
    }));

    return NextResponse.json({ requests: formattedRequests });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
