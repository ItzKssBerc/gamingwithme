const axios = require('axios');
require('dotenv').config();

const CLIENT_ID = process.env.IGDB_CLIENT_ID;
const CLIENT_SECRET = process.env.IGDB_CLIENT_SECRET;

async function getAccessToken() {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });
    return response.data.access_token;
}

async function verifyTwitchSync() {
    const token = await getAccessToken();
    console.log('--- Verifying Twitch Helix Integration ---');

    // 1. Get Top Games from Twitch
    console.log('Step 1: Fetching Top Games from Twitch Helix...');
    const twitchResponse = await axios.get('https://api.twitch.tv/helix/games/top?first=50', {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${token}`
        }
    });

    const twitchGames = twitchResponse.data.data;
    console.log(`Found ${twitchGames.length} categories on Twitch.`);

    const twitchIds = twitchGames.map(g => g.id);

    // 2. Map to IGDB
    console.log('\nStep 2: Mapping Twitch IDs to IGDB IDs...');
    const mappingResponse = await axios.post('https://api.igdb.com/v4/external_games',
        `fields game,uid; where external_game_source = 14 & uid = ("${twitchIds.join('","')}"); limit 50;`,
        {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
            }
        }
    );

    const mappings = mappingResponse.data;
    console.log(`Mapped ${mappings.length} Twitch IDs to IGDB IDs.`);
    const igdbIds = mappings.map(m => m.game);

    if (igdbIds.length === 0) {
        console.log('No games found passing mapping. Exiting.');
        return;
    }

    // 3. Fetch Details with Filters
    console.log('\nStep 3: Fetching IGDB Details with Strict Filters (2015+, Competitive)...');
    const modernDate = Math.floor(new Date('2015-01-01').getTime() / 1000);
    const igdbResponse = await axios.post('https://api.igdb.com/v4/games',
        `fields name, first_release_date, genres.name, game_modes.name;
         where id = (${igdbIds.join(',')}) & 
               version_parent = null & 
               first_release_date > ${modernDate} &
               game_modes = (3,6) & 
               genres = (4,5,10,11,14,15);
         limit 20;`,
        {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
            }
        }
    );

    const finalGames = igdbResponse.data;
    console.log(`\nFinal Competitive Trending Games (${finalGames.length}):`);
    finalGames.forEach((g, i) => {
        const date = new Date(g.first_release_date * 1000).getFullYear();
        const genres = g.genres?.map(gn => gn.name).join(', ') || 'N/A';
        console.log(`${i + 1}. ${g.name} (${date}) - Genres: ${genres}`);
    });
}

verifyTwitchSync().catch(console.error);
