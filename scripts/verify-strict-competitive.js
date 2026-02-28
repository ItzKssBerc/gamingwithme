const axios = require('axios');
require('dotenv').config();

async function verifyStrictCompetitive() {
    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    try {
        const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`);
        const accessToken = tokenResponse.data.access_token;

        const modernDate = Math.floor(new Date('2015-01-01').getTime() / 1000);
        // Testing the EXACT query used in the service now (fallback/trending)
        const igdbQuery = `
      fields name, first_release_date, genres.name, game_modes.name, rating_count;
      where version_parent = null & 
            game_modes = (3,6) & 
            rating_count >= 50 & 
            first_release_date > ${modernDate} &
            genres = (4,5,10,11,14,15) &
            platforms = (6,48,49,130,167,169);
      sort rating_count desc;
      limit 20;
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

        console.log('Results of Strict Modern Competitive Filter:');
        response.data.forEach((g, i) => {
            const year = new Date(g.first_release_date * 1000).getFullYear();
            console.log(`${i + 1}. ${g.name} (${year}) - Genres: ${g.genres?.map(gn => gn.name)}`);
        });

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

verifyStrictCompetitive();
