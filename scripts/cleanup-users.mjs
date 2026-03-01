import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Deleting all users...')
    const deletedUsers = await prisma.user.deleteMany({})
    console.log(`Successfully deleted ${deletedUsers.count} users.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
