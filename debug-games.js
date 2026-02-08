
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const totalGames = await prisma.game.count();
        console.log('Total games in DB:', totalGames);

        if (totalGames === 0) {
            console.log('No games in database.');
            return;
        }

        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        console.log('Trending cutoff date:', twoYearsAgo.toISOString());

        const trendingGames = await prisma.game.count({
            where: {
                releaseDate: {
                    gte: twoYearsAgo.toISOString(),
                },
            },
        });
        console.log('Games matching trending criteria (last 2 years):', trendingGames);

        const firstfew = await prisma.game.findMany({ take: 3, select: { name: true, releaseDate: true } });
        console.log('Sample games:', firstfew);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
