const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
const { PrismaClient } = require('@prisma/client');

const url = process.env.POSTGRES_URL_NON_POOLING;
console.log("Using non-pooling URL");

const prisma = new PrismaClient({
    datasources: { db: { url } }
});

async function main() {
    console.log("Adding clan column...");
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN "clan" TEXT;`);
        console.log("Successfully added clan column.");
    } catch (error) {
        if (error.message.includes("already exists")) {
            console.log("Column already exists.");
        } else {
            console.error("Error adding clan column:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
