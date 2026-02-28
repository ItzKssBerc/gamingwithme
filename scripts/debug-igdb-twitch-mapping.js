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

async function debugMapping() {
    const token = await getAccessToken();
    console.log('--- Deep Search for Mapping 245099 ---');

    const response = await axios.post('https://api.igdb.com/v4/external_games',
        `fields *; where id = 245099;`,
        {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'text/plain'
            }
        }
    );

    console.log('Full mapping data:', JSON.stringify(response.data, null, 2));
}

debugMapping().catch(console.error);
