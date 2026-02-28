const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function getAccessToken() {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
        params: {
            client_id: process.env.IGDB_CLIENT_ID,
            client_secret: process.env.IGDB_CLIENT_SECRET,
            grant_type: 'client_credentials'
        }
    });
    return response.data.access_token;
}

async function cleanup() {
    const games = await prisma.game.findMany({
        where: { igdbId: { not: null } }
    });

    console.log(`Checking ${games.length} games for multiplayer modes...`);
    const token = await getAccessToken();

    for (const game of games) {
        try {
            const response = await axios.post(
                'https://api.igdb.com/v4/games',
                `fields game_modes.id; where id = ${game.igdbId};`,
                {
                    headers: {
                        'Client-ID': process.env.IGDB_CLIENT_ID,
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'text/plain'
                    }
                }
            );

            const igdbGame = response.data[0];
            const isMultiplayer = igdbGame.game_modes ? igdbGame.game_modes.some(mode => [2, 3, 4, 5, 6].includes(mode.id)) : false;

            await prisma.game.update({
                where: { id: game.id },
                data: { isMultiplayer }
            });

            console.log(`${game.name}: ${isMultiplayer ? 'Multiplayer' : 'Single-player (Hidden)'}`);
        } catch (error) {
            console.error(`Error checking ${game.name}:`, error.message);
        }
    }
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
