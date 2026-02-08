
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function seedPopularGames() {
    console.log('🌱 Seeding popular games...');
    try {
        const response = await axios.post(`${BASE_URL}/games/sync/popular`, {
            limit: 20
        });
        console.log(`✅ Synced ${response.data.totalSynced} popular games`);
        if (response.data.totalErrors > 0) {
            console.log(`⚠️  Encountered ${response.data.totalErrors} errors during sync`);
        }
    } catch (error) {
        console.error('❌ Failed to seed popular games:', error.response?.data?.error || error.message);
    }
}

seedPopularGames();
