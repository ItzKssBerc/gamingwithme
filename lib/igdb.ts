import axios from 'axios';

interface IGDBGame {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  storyline?: string;
  rating?: number;
  rating_count?: number;
  first_release_date?: number;
  cover?: {
    id: number;
    url: string;
  };
  genres?: Array<{
    id: number;
    name: string;
  }>;
  platforms?: Array<{
    id: number;
    name: string;
  }>;
  screenshots?: Array<{
    id: number;
    url: string;
  }>;
  videos?: Array<{
    id: number;
    video_id: string;
  }>;
  age_ratings?: Array<{
    category: number;
    rating: number;
  }>;
  game_modes?: Array<{
    id: number;
    name: string;
  }>;
  player_perspectives?: Array<{
    id: number;
    name: string;
  }>;
  websites?: Array<{
    category: number;
    url: string;
  }>;
  similar_games?: Array<{
    id: number;
    name: string;
    cover?: {
      id: number;
      url: string;
    };
  }>;
  dlcs?: Array<{
    id: number;
    name: string;
    cover?: {
      id: number;
      url: string;
    };
  }>;
  expansions?: Array<{
    id: number;
    name: string;
    cover?: {
      id: number;
      url: string;
    };
  }>;
  standalone_expansions?: Array<{
    id: number;
    name: string;
    cover?: {
      id: number;
      url: string;
    };
  }>;
}

interface IGDBTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

class IGDBService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private requestCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.clientId = process.env.IGDB_CLIENT_ID || '';
    this.clientSecret = process.env.IGDB_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      console.warn('IGDB_CLIENT_ID or IGDB_CLIENT_SECRET not configured. IGDB features will be disabled.');
    }
  }

  private async getAccessToken(): Promise<string> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('IGDB credentials not configured. Please set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in your .env file.');
    }

    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post<IGDBTokenResponse>(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minute buffer

      return this.accessToken;
    } catch (error) {
      console.error('Error getting IGDB access token:', error);
      throw new Error('Failed to authenticate with IGDB. Please check your credentials.');
    }
  }

  private getCacheKey(endpoint: string, query: string): string {
    return `${endpoint}:${query}`;
  }

  private getCachedData(cacheKey: string): any | null {
    const cached = this.requestCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(cacheKey: string, data: any): void {
    this.requestCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  private async makeRequest(endpoint: string, query: string): Promise<any[]> {
    const cacheKey = this.getCacheKey(endpoint, query);
    const cachedData = this.getCachedData(cacheKey);

    if (cachedData) {
      return cachedData;
    }

    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `https://api.igdb.com/v4/${endpoint}`,
        query,
        {
          headers: {
            'Client-ID': this.clientId,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'text/plain'
          },
          timeout: 15000 // 15 second timeout
        }
      );

      const data = response.data;
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error('IGDB rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 401) {
        // Clear token and retry once
        this.accessToken = null;
        this.tokenExpiry = 0;
        throw new Error('Authentication failed. Please check your IGDB credentials.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please try again.');
      } else {
        console.error(`Error making IGDB request to ${endpoint}:`, error);
        throw new Error(`Failed to fetch data from IGDB ${endpoint}. Please try again later.`);
      }
    }
  }

  // Public method to make custom requests
  async makeCustomRequest(endpoint: string, query: string): Promise<any[]> {
    return this.makeRequest(endpoint, query);
  }

  async searchGames(query: string, limit: number = 20): Promise<IGDBGame[]> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty');
    }

    // Use name search instead of the search endpoint - only main games, no DLCs, expansions, or seasons
    const searchQuery = `
      fields name,slug,summary,storyline,rating,rating_count,first_release_date,cover.url,genres.name,platforms.name,platforms.id,game_modes.id;
      where version_parent = null & name ~ *"${query}"* & game_modes = (2,3,4,5,6);
      limit ${Math.min(limit, 50)};
      sort rating desc;
    `;

    return this.makeRequest('games', searchQuery);
  }

  async getPopularGames(limit: number = 20): Promise<IGDBGame[]> {
    try {
      // 1. Get trending games based on Visits (Type 1) from popularity_primitives
      // Increasing limit to 250 to find enough games that pass strict competitive filters
      const primQuery = `fields game_id,value; where popularity_type = 1; sort value desc; limit 250;`;
      const primitives = await this.makeRequest('popularity_primitives', primQuery);

      if (!primitives || primitives.length === 0) {
        console.warn('No PopScore primitives found, falling back to all-time popular');
        return this.getFallbackPopularGames(limit);
      }

      const gameIds = primitives.map((p: any) => p.game_id);

      // 2. Fetch full game details for these IDs with multiplayer, non-mobile, and competitive filtering
      // Enforcing multiplayer, non-mobile platforms, and broader competitive genres:
      // Fighting(4), Shooter(5), Music(7), Racing(10), RTS(11), MOBA(14), Sport(15), Simulator(30)
      // and modes (Multiplayer: 2, PvP: 3, Battle Royale: 6)
      const igdbQuery = `
        fields name,slug,summary,storyline,rating,rating_count,first_release_date,cover.url,genres.name,platforms.name,screenshots.url,videos.video_id,age_ratings.rating,game_modes.name,game_modes.id,player_perspectives.name,websites.category,websites.url,similar_games.name,similar_games.cover.url,dlcs.name,dlcs.cover.url,expansions.name,expansions.cover.url,standalone_expansions.name,standalone_expansions.cover.url;
        where id = (${gameIds.join(',')}) & version_parent = null & game_modes = (2,3,6) & platforms = (6,48,49,130,167,169) & genres = (4,5,10,11,14,15,30);
        limit ${limit};
      `;

      const games = await this.makeRequest('games', igdbQuery);

      // Sort games to match the PopScore order
      return games.sort((a, b) => {
        const indexA = gameIds.indexOf(a.id);
        const indexB = gameIds.indexOf(b.id);
        return indexA - indexB;
      });
    } catch (error) {
      console.error('Error fetching trending games from PopScore, falling back to all-time popular:', error);
      return this.getFallbackPopularGames(limit);
    }
  }

  private async getFallbackPopularGames(limit: number = 20): Promise<IGDBGame[]> {
    // All-time popular using rating_count as proxy
    const query = `
      fields name,slug,summary,storyline,rating,rating_count,first_release_date,cover.url,genres.name,platforms.name,screenshots.url,videos.video_id,age_ratings.rating,game_modes.name,game_modes.id,player_perspectives.name,websites.category,websites.url,similar_games.name,similar_games.cover.url,dlcs.name,dlcs.cover.url,expansions.name,expansions.cover.url,standalone_expansions.name,standalone_expansions.cover.url;
      where version_parent = null & game_modes = (2,3,4,5,6) & rating_count >= 100;
      sort rating_count desc;
      limit ${Math.min(limit, 50)};
    `;

    return this.makeRequest('games', query);
  }

  async getGameById(id: number): Promise<IGDBGame | null> {
    if (!id || id <= 0) {
      throw new Error('Invalid game ID');
    }

    const query = `
      fields name,slug,summary,storyline,rating,rating_count,first_release_date,cover.url,genres.name,platforms.name,screenshots.url,videos.video_id,age_ratings.category,age_ratings.rating,game_modes.name,player_perspectives.name,websites.category,websites.url,similar_games.name,similar_games.cover.url,dlcs.name,dlcs.cover.url,expansions.name,expansions.cover.url,standalone_expansions.name,standalone_expansions.cover.url;
      where id = ${id};
    `;

    const games = await this.makeRequest('games', query);
    return games.length > 0 ? games[0] : null;
  }

  async getGameBySlug(slug: string): Promise<IGDBGame | null> {
    if (!slug.trim()) {
      throw new Error('Game slug cannot be empty');
    }

    const query = `
      fields name,slug,summary,storyline,rating,rating_count,first_release_date,cover.url,genres.name,platforms.name,screenshots.url,videos.video_id,age_ratings.category,age_ratings.rating,game_modes.name,player_perspectives.name,websites.category,websites.url,similar_games.name,similar_games.cover.url,dlcs.name,dlcs.cover.url,expansions.name,expansions.cover.url,standalone_expansions.name,standalone_expansions.cover.url;
      where slug = "${slug}";
    `;

    const games = await this.makeRequest('games', query);
    return games.length > 0 ? games[0] : null;
  }

  async getGenres(): Promise<Array<{ id: number; name: string }>> {
    const query = `
      fields name;
      sort name asc;
      limit 50;
    `;

    return this.makeRequest('genres', query);
  }

  async getPlatforms(): Promise<Array<{ id: number; name: string }>> {
    const query = `
      fields name;
      sort name asc;
      limit 50;
    `;

    return this.makeRequest('platforms', query);
  }

  async getGamesByGenre(genreId: number, limit: number = 20): Promise<IGDBGame[]> {
    if (!genreId || genreId <= 0) {
      throw new Error('Invalid genre ID');
    }

    const query = `
      fields name,slug,summary,storyline,rating,rating_count,first_release_date,cover.url,genres.name,platforms.name,screenshots.url,videos.video_id,age_ratings.category,age_ratings.rating,game_modes.name,game_modes.id,player_perspectives.name,websites.category,websites.url,similar_games.name,similar_games.cover.url,dlcs.name,dlcs.cover.url,expansions.name,expansions.cover.url,standalone_expansions.name,standalone_expansions.cover.url;
      where genres = ${genreId} & version_parent = null & category = 0 & game_modes = (2,3,4,5,6);
      sort rating desc;
      limit ${Math.min(limit, 50)};
    `;

    return this.makeRequest('games', query);
  }

  async getGamesByPlatform(platformId: number, limit: number = 20): Promise<IGDBGame[]> {
    if (!platformId || platformId <= 0) {
      throw new Error('Invalid platform ID');
    }

    const query = `
      fields name,slug,summary,storyline,rating,rating_count,first_release_date,cover.url,genres.name,platforms.name,screenshots.url,videos.video_id,age_ratings.category,age_ratings.rating,game_modes.name,game_modes.id,player_perspectives.name,websites.category,websites.url,similar_games.name,similar_games.cover.url,dlcs.name,dlcs.cover.url,expansions.name,expansions.cover.url,standalone_expansions.name,standalone_expansions.cover.url;
      where platforms = ${platformId} & version_parent = null & category = 0 & game_modes = (2,3,4,5,6);
      sort rating desc;
      limit ${Math.min(limit, 50)};
    `;

    return this.makeRequest('games', query);
  }

  // Clear cache method for testing or manual cache management
  clearCache(): void {
    this.requestCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.requestCache.size,
      keys: Array.from(this.requestCache.keys())
    };
  }

  // Check if IGDB is configured
  isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret);
  }
}

export const igdbService = new IGDBService();
export type { IGDBGame }; 