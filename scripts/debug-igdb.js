const axios = require('axios');
require('dotenv').config();

async function testIGDB() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    try {
        // Get token
        const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
        const accessToken = tokenResponse.data.access_token;

        // Get Top Games from Twitch
        const twitchResponse = await axios.get('https://api.twitch.tv/helix/games/top?first=12', {
            headers: {
                'Client-ID': clientId,
                'Authorization': `Bearer ${accessToken}`
            }
        });

        console.log('Twitch Top Games:', twitchResponse.data.data.map(g => g.name));
    } catch (error) {
        if (error.response) {
            console.error('IGDB Error:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testIGDB();
