const axios = require('axios');
require('dotenv').config();

async function debugCompetitivePopScore() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    try {
        const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
        const accessToken = tokenResponse.data.access_token;

        console.log('--- Step 1: Fetching Raw PopScore Primitives (Type 1: Visits) ---');
        const primResponse = await axios.post(
            'https://api.igdb.com/v4/popularity_primitives',
            'fields game_id,value; where popularity_type = 1; sort value desc; limit 100;',
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'text/plain'
                }
            }
        );

        const gameIds = primResponse.data.map(p => p.game_id);
        console.log(`Fetched ${gameIds.length} game IDs from PopScore.`);

        console.log('\n--- Step 2: Checking Genres/Modes/Platforms for these IDs ---');
        // We'll fetch the details for the top 50 to see why they might be filtered
        const igdbQuery = `
      fields name, genres.name, game_modes.name, platforms.name, version_parent;
      where id = (${gameIds.slice(0, 50).join(',')});
      limit 50;
    `;

        const gamesResponse = await axios.post(
            'https://api.igdb.com/v4/games',
            igdbQuery,
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    'Content-Type': 'text/plain'
                }
            }
        );

        const games = gamesResponse.data;

        console.log('Analysis of top 50 trending games:');
        games.forEach((g, i) => {
            const isMain = g.version_parent === undefined || g.version_parent === null;
            const genres = g.genres?.map(gn => gn.name) || [];
            const modes = g.game_modes?.map(m => m.name) || [];
            const platforms = g.platforms?.map(p => p.id) || [];

            // Competitive Genres: Shooter(5), Racing(10), MOBA(14), Fighting(4)
            const isCompetitiveGenre = g.genres?.some(gn => [4, 5, 10, 14].includes(gn.id));
            // Competitive Modes: Multiplayer(2), PvP(3), Battle Royale(6)
            const isCompetitiveMode = g.game_modes?.some(m => [2, 3, 6].includes(m.id));
            // Non-Mobile Platforms: PC(6), PS4(48), PS5(167), XB1(49), XBS(169), Switch(130)
            const isNonMobile = g.platforms?.some(p => [6, 48, 49, 130, 167, 169].includes(p.id));

            console.log(`${i + 1}. ${g.name} (ID: ${g.id})`);
            console.log(`   - Main: ${isMain}, Genres: ${genres}, Modes: ${modes}`);
            console.log(`   - Competitive Genre: ${isCompetitiveGenre}, Competitive Mode: ${isCompetitiveMode}, Non-Mobile: ${isNonMobile}`);

            if (!(isMain && isCompetitiveGenre && isCompetitiveMode && isNonMobile)) {
                console.log(`   [FILTERED OUT]`);
            } else {
                console.log(`   [PASSES]`);
            }
        });

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

debugCompetitivePopScore();
