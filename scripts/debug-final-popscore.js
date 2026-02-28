const axios = require('axios');
require('dotenv').config();

async function debugCurrentPopScore() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    try {
        const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
        const accessToken = tokenResponse.data.access_token;

        console.log('--- Fetching PopScore Primitives (Type 1: Visits) ---');
        const primResponse = await axios.post(
            'https://api.igdb.com/v4/popularity_primitives',
            'fields game_id,value; where popularity_type = 1; sort value desc; limit 20;',
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
        console.log('Top Game IDs:', gameIds);

        console.log('\n--- Fetching Game Details for these IDs ---');
        const igdbQuery = `
      fields name, rating_count, game_modes;
      where id = (${gameIds.join(',')});
      limit 20;
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

        // Check sorting
        const sorted = games.sort((a, b) => {
            const indexA = gameIds.indexOf(a.id);
            const indexB = gameIds.indexOf(b.id);
            return indexA - indexB;
        });

        console.log('Final Sorted Names (PopScore Order):');
        sorted.forEach((g, i) => console.log(`${i + 1}. ${g.name} (ID: ${g.id}) [Modes: ${JSON.stringify(g.game_modes)}]`));

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

debugCurrentPopScore();
