
require('dotenv').config({ path: '.env' });
const axios = require('axios');

async function testCategory() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const tokenRes = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: clientId,
            client_secret: process.env.IGDB_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });
    const token = tokenRes.data.access_token;

    console.log('--- Fetching Starsiege: Tribes ---');
    try {
        const res = await axios.post(
            'https://api.igdb.com/v4/games',
            'fields name,category; search "Starsiege: Tribes"; limit 1;',
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                }
            }
        );
        if (res.data.length > 0) {
            console.log('Name:', res.data[0].name);
            console.log('Category:', res.data[0].category);
        } else {
            console.log('Not found');
        }
    } catch (e) {
        console.error(e.message);
    }
}

testCategory();
