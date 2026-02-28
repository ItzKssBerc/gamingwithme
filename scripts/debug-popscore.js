const axios = require('axios');
require('dotenv').config();

async function testPopScore() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    try {
        const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
        const accessToken = tokenResponse.data.access_token;

        console.log('--- Testing popularity_primitives ---');

        const typesToTest = [9, 3]; // 9: Top Sellers, 3: Playing

        for (const typeId of typesToTest) {
            console.log(`\n--- Type ${typeId} ---`);
            const primResponse = await axios.post(
                'https://api.igdb.com/v4/popularity_primitives',
                `fields game_id,value; where popularity_type = ${typeId}; sort value desc; limit 10;`,
                {
                    headers: {
                        'Client-ID': clientId,
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/json',
                        'Content-Type': 'text/plain'
                    }
                }
            );

            if (primResponse.data.length > 0) {
                const ids = primResponse.data.map(p => p.game_id).join(',');
                const gamesResponse = await axios.post(
                    'https://api.igdb.com/v4/games',
                    `fields name; where id = (${ids});`,
                    {
                        headers: {
                            'Client-ID': clientId,
                            'Authorization': `Bearer ${accessToken}`,
                            'Accept': 'application/json',
                            'Content-Type': 'text/plain'
                        }
                    }
                );

                // Sort gamesResponse to match primitive order
                const sortedGames = primResponse.data.map(p => {
                    const game = gamesResponse.data.find(g => g.id === p.game_id);
                    return game ? game.name : 'Unknown';
                });

                console.log(JSON.stringify(sortedGames, null, 2));
            } else {
                console.log('No primitives found for this type.');
            }
        }

    } catch (error) {
        if (error.response) {
            console.error('IGDB Error:', error.response.status, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testPopScore();
