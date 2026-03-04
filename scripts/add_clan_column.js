const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log("Adding clan column...");
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN "clan" TEXT;`);
        console.log("Successfully added clan column.");
    } catch (error) {
        console.error("Error adding clan column:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
