const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const total = await prisma.game.count();
    const multiplayer = await prisma.game.count({ where: { isMultiplayer: true } });
    const singleplayer = await prisma.game.count({ where: { isMultiplayer: false } });

    console.log(`Total games in DB: ${total}`);
    console.log(`Multiplayer games (Visible): ${multiplayer}`);
    console.log(`Single-player games (Hidden): ${singleplayer}`);
}

check().catch(console.error).finally(() => prisma.$disconnect());
