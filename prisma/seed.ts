import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const adminPw = await bcrypt.hash('admin123456', 12)
  const admin = await db.user.upsert({
    where:  { email: process.env.ADMIN_EMAIL ?? 'admin@fowziabloodline.com' },
    update: {},
    create: {
      name:         'Platform Admin',
      email:        process.env.ADMIN_EMAIL ?? 'admin@fowziabloodline.com',
      phone:        '01700000000',
      passwordHash: adminPw,
      role:         'ADMIN',
      isVerified:   true,
    },
  })
  console.log('Admin created:', admin.email)

  // Sample donors
  const sampleDonors = [
    { name: 'Rahim Mia',     phone: '01711111111', bloodGroup: 'A_POS' as const, district: 'Dhaka',       area: 'Mirpur'     },
    { name: 'Nasrin Akter',  phone: '01722222222', bloodGroup: 'B_POS' as const, district: 'Chittagong',  area: 'Agrabad'    },
    { name: 'Kamal Uddin',   phone: '01733333333', bloodGroup: 'O_POS' as const, district: 'Rajshahi',    area: 'Boalia'     },
    { name: 'Sumaiya Begum', phone: '01744444444', bloodGroup: 'AB_POS' as const,district: 'Sylhet',      area: 'Zindabazar' },
    { name: 'Faruk Ahmed',   phone: '01755555555', bloodGroup: 'O_NEG' as const, district: 'Dhaka',       area: 'Dhanmondi'  },
  ]

  for (const donor of sampleDonors) {
    const pw = await bcrypt.hash('donor123456', 12)
    const email = `${donor.name.toLowerCase().replace(/\s+/g, '.')}@example.com`
    await db.user.upsert({
      where:  { email },
      update: {},
      create: {
        name:         donor.name,
        email,
        phone:        donor.phone,
        passwordHash: pw,
        role:         'DONOR',
        isVerified:   true,
        donorProfile: {
          create: {
            bloodGroup:        donor.bloodGroup,
            district:          donor.district,
            area:              donor.area,
            bkashNumber:       donor.phone,
            donationCount:     Math.floor(Math.random() * 8) + 1,
            reputationScore:   4 + Math.random(),
            isProfileVerified: true,
            isEligible:        true,
          },
        },
      },
    })
  }

  console.log('Seed complete.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
