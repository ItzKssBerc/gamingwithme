import { NextRequest, NextResponse } from 'next/server';
import { igdbService } from '@/lib/igdb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Use the new PopScore-based popular games from the service
    // This ensures consistent trending logic across the app
    const games = await igdbService.getPopularGames(limit + offset);
    // Slice for pagination if offset is used
    const paginatedGames = offset > 0 ? games.slice(offset, offset + limit) : games.slice(0, limit);

    // Transform to match app format
    const transformedGames = paginatedGames.map(game => ({
      id: game.id.toString(),
      name: game.name,
      slug: game.slug,
      description: game.summary || game.storyline,
      image: game.cover?.url ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.url.split('/').pop()}` : null,
      genre: game.genres?.[0]?.name || null,
      platform: game.platforms?.[0]?.name || null,
      rating: game.rating || null,
      releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000) : null,
      igdbRating: game.rating || null,
      igdbRatingCount: game.rating_count || null,
      igdbCoverUrl: game.cover?.url ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.url.split('/').pop()}` : null
    }));

    const hasNext = paginatedGames.length === limit;

    return NextResponse.json({
      games: transformedGames,
      pagination: {
        page,
        limit,
        hasNext,
        hasPrev: page > 1,
        nextPage: hasNext ? page + 1 : null,
        prevPage: page > 1 ? page - 1 : null
      }
    });
  } catch (error) {
    console.error('Error fetching popular games:', error);
    return NextResponse.json(
      { error: 'Failed to fetch popular games' },
      { status: 500 }
    );
  }
} 