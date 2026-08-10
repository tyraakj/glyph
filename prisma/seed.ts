import { prisma } from '../lib/prisma'

async function main() {
  console.log('Seeding database...')
  
  await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      id: 'usr_1',
      email: 'alice@example.com',
      name: 'Alice',
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  })

  await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      id: 'usr_2',
      email: 'bob@example.com',
      name: 'Bob',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
  })
  console.log('Database seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
