
require('dotenv').config({ path: '.env' });
const axios = require('axios');

async function testDirect() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    console.log('Client ID:', clientId ? (clientId.substring(0, 5) + '...') : 'MISSING');
    console.log('Client Secret:', clientSecret ? (clientSecret.substring(0, 5) + '...') : 'MISSING');

    if (!clientId || !clientSecret) {
        console.error('Missing credentials in .env');
        return;
    }

    // 1. Get Token
    console.log('Getting token...');
    let token;
    try {
        const tokenRes = await axios.post(
            'https://id.twitch.tv/oauth2/token',
            null,
            {
                params: {
                    client_id: clientId,
                    client_secret: clientSecret,
                    grant_type: 'client_credentials'
                }
            }
        );
        token = tokenRes.data.access_token;
        console.log('Token received:', token.substring(0, 10) + '...');
    } catch (e) {
        console.error('Failed to get token:', e.message);
        if (e.response) console.error(e.response.data);
        return;
    }

    // 2. Query Games (Raw with newlines)
    const queryIndented = `
    fields name,slug,rating;
    where rating_count > 10;
    limit 5;
  `;

    console.log('Testing indented query...');
    try {
        const res = await axios.post(
            'https://api.igdb.com/v4/games',
            queryIndented,
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                }
            }
        );
        console.log(`Received ${res.data.length} games (indented query).`);
        if (res.data.length > 0) console.log('Sample:', res.data[0].name);
    } catch (e) {
        console.error('Indented query failed:', e.message);
        if (e.response) console.error(e.response.data);
    }

    // 3. Query Games (Clean)
    const queryClean = 'fields name,slug,rating; where rating_count > 10; limit 5;';

    console.log('Testing clean query...');
    try {
        const res = await axios.post(
            'https://api.igdb.com/v4/games',
            queryClean,
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                }
            }
        );
        console.log(`Received ${res.data.length} games (clean query).`);
        if (res.data.length > 0) console.log('Sample:', res.data[0].name);
    } catch (e) {
        console.error('Clean query failed:', e.message);
        if (e.response) console.error(e.response.data);
    }

    // 4. Test Exact Failing Query
    const failingQuery = `
      fields name,slug,rating,rating_count;
      where rating_count > 100 & version_parent = null & category = 0;
      sort rating desc;
      limit 20;
  `;
    console.log('Testing exact failing query...');
    try {
        const res = await axios.post(
            'https://api.igdb.com/v4/games',
            failingQuery,
            {
                headers: {
                    'Client-ID': clientId,
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'text/plain'
                }
            }
        );
        console.log(`Received ${res.data.length} games (failing query).`);
        if (res.data.length > 0) {
            console.log('Sample:', res.data[0].name);
            console.log('Rating Count:', res.data[0].rating_count);
        }
    } catch (e) {
        console.error('Failing query failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
    // 5. Test Category Field specifically
    console.log('--- Focused Category Test ---');
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
            console.log('Game:', res.data[0].name);
            console.log('Category:', res.data[0].category);
            console.log('Full Object:', JSON.stringify(res.data[0]));
        } else {
            console.log('Starsiege: Tribes not found.');
        }
    } catch (e) {
        console.error('Category test failed:', e.message);
        if (e.response) console.error(e.response.data);
    }
    // 5. Test Variations
    const variations = [
        {
            name: 'No version_parent',
            query: 'fields name; where rating_count > 100 & category = 0; limit 5;'
        },
        {
            name: 'No category',
            query: 'fields name,category; where rating_count > 100 & version_parent = null; limit 5;'
        },
        {
            name: 'Low rating_count',
            query: 'fields name; where rating_count > 10 & version_parent = null & category = 0; limit 5;'
        }
    ];

    for (const v of variations) {
        console.log(`Testing variation: ${v.name}...`);
        try {
            const res = await axios.post(
                'https://api.igdb.com/v4/games',
                v.query,
                {
                    headers: {
                        'Client-ID': clientId,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            );
            console.log(`Received ${res.data.length} games.`);
        } catch (e) {
            console.error(`Variation ${v.name} failed:`, e.message);
        }
    }

    // Print category for No category variation
    console.log('--- Categories ---');
    if (variations[1].name === 'No category') {
        try {
            const res = await axios.post(
                'https://api.igdb.com/v4/games',
                variations[1].query,
                {
                    headers: {
                        'Client-ID': clientId,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            );
            if (res.data.length > 0) {
                console.log('Sample Game Object:', JSON.stringify(res.data[0], null, 2));
            } else {
                console.log('No games found in No category variation.');
            }
        } catch (e) { }
    }
}

testDirect();
