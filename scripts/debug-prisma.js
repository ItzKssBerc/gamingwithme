const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const dmmf = await prisma._getDmmf();
    const gameModel = dmmf.datamodel.models.find(m => m.name === 'Game');
    console.log('Game fields:', gameModel.fields.map(f => f.name).join(', '));
}

check().catch(console.error).finally(() => prisma.$disconnect());
