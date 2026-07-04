import { redirect }          from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db }               from '@/lib/db'
import Navbar               from '@/components/Navbar'
import AdminDashboardClient from '@/components/admin/AdminDashboardClient'

export const metadata = { title: 'Admin Panel' }

export default async function AdminPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'ADMIN') redirect('/login')

  const [
    pendingDonations,
    pendingFeedback,
    totalDonors,
    totalRecipients,
    pendingRewards,
    recentActions,
    pendingPlatformDonations,
    platformDonationStats,
  ] = await Promise.all([
    db.donationEvent.findMany({
      where: { status: 'PENDING' },
      include: {
        donorProfile: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
    db.feedback.findMany({
      where: { status: 'PENDING' },
      include: {
        donorProfile: { include: { user: { select: { name: true } } } },
        recipient:    { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
    db.donorProfile.count(),
    db.recipientProfile.count(),
    db.rewardTransaction.count({ where: { status: 'PENDING' } }),
    db.adminAction.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { admin: { select: { name: true } } } }),
    db.platformDonation.findMany({
      where:   { isVerified: false },
      orderBy: { createdAt: 'asc' },
      take:    30,
    }),
    db.platformDonation.aggregate({
      where:  { isVerified: true },
      _sum:   { amount: true, coconutsCount: true },
      _count: { id: true },
    }),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <AdminDashboardClient
        data={JSON.parse(JSON.stringify({
          pendingDonations,
          pendingFeedback,
          totalDonors,
          totalRecipients,
          pendingRewards,
          recentActions,
          pendingPlatformDonations,
          platformDonationStats: {
            total:    platformDonationStats._count.id,
            amount:   Number(platformDonationStats._sum.amount    ?? 0),
            coconuts: Number(platformDonationStats._sum.coconutsCount ?? 0),
          },
        }))}
      />
    </div>
  )
}
