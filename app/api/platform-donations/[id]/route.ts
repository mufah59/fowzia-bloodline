import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'
import { db } from '@/lib/db'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.user_metadata?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action } = await req.json()

    if (action === 'VERIFY') {
      await db.$transaction(async tx => {
        await tx.platformDonation.update({
          where: { id: params.id },
          data:  { isVerified: true },
        })
        await tx.adminAction.create({
          data: {
            adminId:    user.id,
            action:     'VERIFY_PLATFORM_DONATION',
            targetType: 'PlatformDonation',
            targetId:   params.id,
          },
        })
      })
      return NextResponse.json({ success: true })
    }

    if (action === 'HIDE') {
      await db.platformDonation.update({
        where: { id: params.id },
        data:  { isPublic: false },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (err) {
    console.error('[PLATFORM_DONATION_PATCH]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
