// backend/prisma/seed.js
// Run: node prisma/seed.js

require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Super Admin
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@crewng.com'
  const adminPass  = process.env.SUPER_ADMIN_PASSWORD || 'Admin@2026!'
  const passwordHash = await bcrypt.hash(adminPass, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash,
      primaryRole: 'COORDINATOR',
      roles: ['COORDINATOR'],
      isSuper: true,
      isAdmin: true,
      isSuperAdmin: true,
      adminLevel: 'SUPER_ADMIN',
      wallet: { create: { balance: 0 } },
    },
  })

  console.log(`✅ Super Admin created: ${adminEmail}`)
  console.log(`   Password: ${adminPass}`)
  console.log(`   Role: SUPER_ADMIN`)
  console.log('')
  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('📌 Next steps:')
  console.log('   1. Start the backend: npm run dev')
  console.log('   2. Start the frontend: cd ../frontend && npm run dev')
  console.log('   3. Open http://localhost:5173')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
