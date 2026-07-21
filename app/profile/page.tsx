import { redirect }         from 'next/navigation'
import { getCurrentUser }   from '@/lib/supabase-server'
import { db }               from '@/lib/db'
import Navbar                         from '@/components/Navbar'
import Footer                         from '@/components/Footer'
import ProfileClient                  from '@/components/ProfileClient'

export const metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/profile')

  const role = user.user_metadata?.role as string | undefined

  if (role === 'DONOR') {
    const profile = await db.donorProfile.findUnique({
      where:   { userId: user.id },
      include: { user: { select: { name: true, email: true, phone: true, createdAt: true, isVerified: true } } },
    })
    if (!profile) redirect('/register/donor')

    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <ProfileClient profile={JSON.parse(JSON.stringify(profile))} role="DONOR" />
        <Footer />
      </div>
    )
  }

  if (role === 'RECIPIENT') {
    const profile = await db.recipientProfile.findUnique({
      where:   { userId: user.id },
      include: { user: { select: { name: true, email: true, phone: true, createdAt: true, isVerified: true } } },
    })
    if (!profile) redirect('/register/recipient')

    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <ProfileClient profile={JSON.parse(JSON.stringify(profile))} role="RECIPIENT" />
        <Footer />
      </div>
    )
  }

  redirect('/login')
}
