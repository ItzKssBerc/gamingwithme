const { prisma } = require('../lib/prisma')

async function main() {
  try {
    const n = await prisma.user.count()
    console.log('OK, users:', n)
  } catch (e) {
    console.error('PRISMA CHECK ERROR', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
