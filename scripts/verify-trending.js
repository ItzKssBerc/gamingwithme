const axios = require('axios');
require('dotenv').config();

async function testServiceLogic() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    try {
        const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
        const accessToken = tokenResponse.data.access_token;

        // 1. Get Twitch Top Games
        const twitchResponse = await axios.get('https://api.twitch.tv/helix/games/top?first=10', {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        const twitchGames = twitchResponse.data.data
            .map(g => g.name)
            .filter(name => name !== 'Just Chatting' && name !== 'Art' && name !== 'Music' && name !== 'Talk Shows & Podcasts');

        console.log('Twitch Top Games:', twitchGames);

        // 2. Search IGDB
        const namesQuery = twitchGames.map(name => `"${name}"`).join(',');
        const igdbQuery = `
      fields name,slug,rating_count,game_modes.id;
      where name = (${namesQuery}) & version_parent = null;
      limit 10;
    `;

        const response = await axios.post(
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

        console.log('IGDB Matches:', response.data.map(g => g.name));

        // Sort
        const sorted = response.data.sort((a, b) => {
            const indexA = twitchGames.indexOf(a.name);
            const indexB = twitchGames.indexOf(b.name);
            return indexA - indexB;
        });

        console.log('Sorted Result Order:', sorted.map(g => g.name));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testServiceLogic();
