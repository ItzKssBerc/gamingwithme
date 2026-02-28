import { NextRequest, NextResponse } from 'next/server';
import { igdbService } from '@/lib/igdb';

// This is the most important line. It prevents Next.js from caching the API response.
// This ensures that every request is processed fresh, reflecting the latest sorting options.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    // Trending esetén mindig 100-as limit
    let limit = parseInt(searchParams.get('limit') || '12');
    const now = new Date();
    const currentYear = now.getFullYear();
    const genre = searchParams.get('genre');
    const platform = searchParams.get('platform');

    // Trending: rating_count szerint rendezünk, ha nincs orderBy megadva
    // A PopScore-t/Twitch-et elsősorban a "Popular" szekcióhoz használjuk
    let orderByParam = searchParams.get('orderBy') || '-rating';
    const isPopularRequest = orderByParam === '-rating' && !query.trim() && !genre && !platform;

    if (isPopularRequest) {
      console.log('Detected Popular Games request, using live Twitch viewership ranking');
      // Fetch 100 popular games to handle pagination better
      const popularGames = await igdbService.getPopularGames(100);

      const offset = (page - 1) * limit;
      const paginatedGames = popularGames.slice(offset, offset + limit);

      const transformedGames = paginatedGames.map(game => {
        const coverUrl = game.cover?.url;
        const bigCoverUrl = coverUrl ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverUrl.split('/').pop()}` : null;
        return {
          id: game.id.toString(),
          name: game.name,
          slug: game.slug,
          description: game.summary || game.storyline || '',
          image: bigCoverUrl,
          genre: game.genres?.[0]?.name || null,
          platform: game.platforms?.[0]?.name || null,
          platforms: game.platforms || [],
          rating: game.rating || null,
          releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000) : null,
          igdbRating: game.rating || null,
          igdbRatingCount: game.rating_count || null,
          igdbCoverUrl: bigCoverUrl,
          twitchViewerCount: game.twitchViewerCount || 0
        };
      });

      return NextResponse.json({
        games: transformedGames,
        pagination: {
          page,
          limit,
          total: popularGames.length,
          totalPages: Math.ceil(popularGames.length / limit),
          hasNext: page < Math.ceil(popularGames.length / limit),
          hasPrev: page > 1,
          nextPage: page < Math.ceil(popularGames.length / limit) ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null
        }
      });
    }

    // Normal filter-based logic for other sorts or searches
    let sortField = orderByParam;
    let sortOrder = 'asc';
    if (orderByParam.startsWith('-')) {
      sortOrder = 'desc';
      sortField = orderByParam.substring(1);
    }

    const offset = (page - 1) * limit;

    // Build the WHERE clause for the IGDB query
    // Trending: established competitive games (PvP/Battle Royale, Esport műfajok)
    let whereClauses = [
      'version_parent = null',
      'game_modes = (2,6)',
      'genres = (4,5,10,11,14,15,24,36)',
      'genres != (12,31)',
      'themes != (31,33,38)',
      'platforms = (6,48,49,130,167,169)'
    ];

    // Ha nincs keresés, alkalmazunk egy alap népszerűségi szűrőt
    if (!query.trim()) {
      whereClauses.push('rating_count >= 50');
    }
    if (query.trim()) {
      whereClauses.push(`name ~ *\"${query}\"*`);
    }
    if (genre && genre !== 'All') {
      whereClauses.push(`genres.name = \"${genre}\"`);
    }
    if (platform && platform !== 'All') {
      whereClauses.push(`platforms.name = \"${platform}\"`);
    }

    // Build the final IGDB query string
    const igdbQuery = `
      fields name,slug,summary,storyline,rating,rating_count,first_release_date,cover.url,genres.name,platforms.name,platforms.id,game_modes.id;
      where ${whereClauses.join(' & ')};
      sort ${sortField} ${sortOrder};
      limit ${limit};
      offset ${offset};
    `;

    console.log('Is IGDB configured:', igdbService.isConfigured());
    console.log('Sending IGDB query:', igdbQuery);

    const games = await igdbService.makeCustomRequest('games', igdbQuery);
    console.log(`Received ${games.length} games from IGDB`);

    // For pagination
    const totalCount = games.length === limit ? (page * limit + 100) : ((page - 1) * limit + games.length);

    // Transform IGDB data to our application's format
    const transformedGames = (games || []).map(game => {
      try {
        const coverUrl = game.cover?.url;
        const bigCoverUrl = coverUrl ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${coverUrl.split('/').pop()}` : null;

        return {
          id: game.id?.toString() || Math.random().toString(),
          name: game.name || 'Unknown Game',
          slug: game.slug || '',
          description: game.summary || game.storyline || '',
          image: bigCoverUrl,
          genre: game.genres?.[0]?.name || null,
          platform: game.platforms?.[0]?.name || null,
          platforms: game.platforms || [],
          rating: game.rating || null,
          releaseDate: game.first_release_date ? new Date(game.first_release_date * 1000) : null,
          igdbRating: game.rating || null,
          igdbRatingCount: game.rating_count || null,
          igdbCoverUrl: bigCoverUrl
        };
      } catch (transformError) {
        console.error(`Error transforming game ${game.id}:`, transformError);
        return null;
      }
    }).filter(Boolean);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages && games.length === limit;
    const hasPrev = page > 1;

    return NextResponse.json({
      games: transformedGames,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      }
    });

  } catch (error: any) {
    console.error('Error fetching games from IGDB:', error);
    // Add a specific log for configuration issues.
    if (!igdbService.isConfigured()) {
      console.error('IGDB Service is not configured. Please check your .env file for IGDB_CLIENT_ID and IGDB_CLIENT_SECRET.');
    }
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch games from IGDB',
        games: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false, nextPage: null, prevPage: null }
      },
      { status: 500 }
    );
  }
}