import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Generates a unique, URL-friendly slug from a given name.
 * @param name The string to convert into a slug.
 * @returns A unique slug string.
 */
const generateSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 70);
  return `${baseSlug}-${Date.now()}`;
};

/**
 * Handles GET requests to fetch all services for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const services = await prisma.fixedService.findMany({
      where: { providerId: user.id },
      include: {
        game: true,
        platform: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching user services:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch services.',
        details: error instanceof Error ? error.message : 'An unknown error occurred.',
      },
      { status: 500 }
    );
  }
}

/**
 * Handles POST requests to create a new service for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, price, duration, slots, game, platform } = body;

    // --- Data Validation ---
    if (!title || !description || !price || !duration || !slots) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const parsedPrice = parseFloat(price);
    const parsedDuration = parseInt(duration, 10);
    const parsedSlots = parseInt(slots, 10);

    if (isNaN(parsedPrice) || isNaN(parsedDuration) || isNaN(parsedSlots) || parsedPrice <= 0 || parsedDuration <= 0 || parsedSlots <= 0) {
      return NextResponse.json({ error: 'Price, duration, and slots must be valid positive numbers.' }, { status: 400 });
    }

    // --- Prepare Service Data ---
    const serviceData: any = {
      providerId: user.id,
      title,
      description,
      price: parsedPrice,
      duration: parsedDuration,
      slots: parsedSlots,
      isActive: true,
    };

    // --- Upsert Game and Platform ---
    if (game?.id && game?.name) {
      const gameSlug = generateSlug(game.name);
      const upsertedGame = await prisma.game.upsert({
        where: { igdbId: game.id },
        update: { name: game.name },
        create: { igdbId: game.id, name: game.name, slug: gameSlug },
      });
      serviceData.gameId = upsertedGame.id;
    }

    if (platform?.id && platform?.name) {
      const platformSlug = generateSlug(platform.name);
      const upsertedPlatform = await prisma.platform.upsert({
        where: { igdbId: platform.id },
        update: { name: platform.name },
        create: { igdbId: platform.id, name: platform.name, slug: platformSlug },
      });
      serviceData.platformId = upsertedPlatform.id;
    }

    // --- Create Final Service ---
    const service = await prisma.fixedService.create({
      data: serviceData,
    });

    return NextResponse.json({ service, message: 'Service created successfully' }, { status: 201 });

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      {
        error: 'Failed to create service.',
        details: error instanceof Error ? error.message : 'An unknown error occurred.',
      },
      { status: 500 }
    );
  }
}
