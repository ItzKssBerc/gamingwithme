import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const game = searchParams.get('game') || '';
    const language = searchParams.get('language') || '';
    const tag = searchParams.get('tag') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = (page - 1) * limit;

    const whereConditions: any = {
      isAdmin: false,
    };

    if (status && status !== 'All') {
      whereConditions.isActive = status === 'active';
    }

    if (query) {
      whereConditions.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (game && game !== 'All') {
      whereConditions.userGames = {
        some: {
          game: {
            name: game,
          },
        },
      };
    }

    if (language && language !== 'All') {
      whereConditions.userLanguages = {
        some: {
          language: language,
        },
      };
    }

    if (tag && tag !== 'All') {
      whereConditions.userTags = {
        some: {
          tag: tag,
        },
      };
    }

    const users = await prisma.user.findMany({
      where: whereConditions,
      include: {
        userGames: { include: { game: true } },
        userLanguages: true,
        userTags: true,
        userAvailability: { where: { isActive: true } },
        reviewsReceived: { select: { rating: true } },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const totalCount = await prisma.user.count({ where: whereConditions });

    const gamers = users.map(user => {
      const totalRating = user.reviewsReceived.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = user.reviewsReceived.length > 0 ? totalRating / user.reviewsReceived.length : 0;

      const avgHourlyRate = user.userAvailability.length > 0
        ? user.userAvailability.reduce((sum, avail) => sum + avail.price, 0) / user.userAvailability.length
        : 0;

      return {
        id: user.id,
        username: user.username,
        avatar: user.avatar || null,
        bio: user.bio || 'No bio available',
        games: user.userGames.map(ug => ug.game.name),
        languages: user.userLanguages.map(ul => ul.language),
        rating: Math.round(averageRating * 10) / 10,
        hourlyRate: Math.round(avgHourlyRate),
        availability: user.userAvailability.length > 0 ? `${user.userAvailability.length} time slots available` : 'No availability set',
        tags: user.userTags.filter(ut => !ut.tag.startsWith('category:')).map(ut => ut.tag),
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      gamers,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        nextPage: page < totalPages ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null,
      },
    });

  } catch (error) {
    console.error('Error fetching gamers:', error);
    return NextResponse.json({ error: 'Failed to fetch gamers' }, { status: 500 });
  }
}