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

async function checkTopGamesFields() {
    const token = await getAccessToken();
    console.log('--- Checking Twitch Helix Top Games Fields ---');

    const response = await axios.get('https://api.twitch.tv/helix/games/top?first=1', {
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': `Bearer ${token}`
        }
    });

    console.log('Full Top Game Object:', JSON.stringify(response.data.data[0], null, 2));
}

checkTopGamesFields().catch(console.error);
