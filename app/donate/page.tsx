import Navbar  from '@/components/Navbar'
import Footer  from '@/components/Footer'
import DonateClient from '@/components/DonateClient'
import { db } from '@/lib/db'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Support Fowzia Bloodline — Donate',
  description: 'Your donation funds the coconut rewards we give to every blood donor. Help us keep this platform alive and growing.',
}

export default async function DonatePage() {
  const [stats, recentDonors] = await Promise.all([
    db.platformDonation.aggregate({
      where:   { isVerified: true },
      _sum:    { amount: true, coconutsCount: true },
      _count:  { id: true },
    }),
    db.platformDonation.findMany({
      where:   { isVerified: true, isPublic: true },
      orderBy: { createdAt: 'desc' },
      take:    6,
      select:  { id: true, name: true, profession: true, amount: true, coconutsCount: true, message: true, createdAt: true },
    }),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <DonateClient
        stats={{
          totalDonors:   stats._count.id,
          totalAmount:   Number(stats._sum.amount ?? 0),
          totalCoconuts: Number(stats._sum.coconutsCount ?? 0),
        }}
        recentDonors={JSON.parse(JSON.stringify(recentDonors))}
      />
      <Footer />
    </div>
  )
}
