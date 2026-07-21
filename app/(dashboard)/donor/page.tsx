import { redirect }          from 'next/navigation'
import { getCurrentUser }   from '@/lib/supabase-server'
import { db }               from '@/lib/db'
import Navbar               from '@/components/Navbar'
import Footer               from '@/components/Footer'
import DonorDashboardClient from '@/components/donor/DonorDashboardClient'

export const metadata = { title: 'Donor Dashboard' }

export default async function DonorDashboardPage() {
  const user = await getCurrentUser()
  if (!user || user.user_metadata?.role !== 'DONOR') redirect('/login?callbackUrl=/donor/dashboard')

  const userId = user.id

  const profile = await db.donorProfile.findUnique({
    where: { userId },
    include: {
      user:          { select: { name: true, email: true, phone: true, isVerified: true } },
      donationEvents:{ orderBy: { donationDate: 'desc' }, take: 5 },
      rewardLedger:  { orderBy: { createdAt: 'desc' },   take: 5 },
      feedbackReceived: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { recipient: { select: { name: true } } },
      },
    },
  })

  if (!profile) redirect('/register/donor')

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <DonorDashboardClient profile={JSON.parse(JSON.stringify(profile))} />
      <Footer />
    </div>
  )
}
