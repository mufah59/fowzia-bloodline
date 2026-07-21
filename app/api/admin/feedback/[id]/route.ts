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
    if (!['APPROVED', 'REJECTED'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
    }

    const feedback = await db.feedback.findUnique({ where: { id: params.id } })
    if (!feedback) return NextResponse.json({ error: 'Feedback not found.' }, { status: 404 })
    if (feedback.status !== 'PENDING') return NextResponse.json({ error: 'Already reviewed.' }, { status: 409 })

    await db.$transaction(async tx => {
      await tx.feedback.update({
        where: { id: params.id },
        data:  { status: action },
      })

      if (action === 'APPROVED') {
        const all = await tx.feedback.findMany({
          where:  { donorProfileId: feedback.donorProfileId, status: 'APPROVED' },
          select: { rating: true },
        })
        const avg = all.length ? all.reduce((s, f) => s + f.rating, 0) / all.length : 0
        await tx.donorProfile.update({
          where: { id: feedback.donorProfileId },
          data:  { reputationScore: Math.round(avg * 100) / 100 },
        })
      }

      await tx.adminAction.create({
        data: {
          adminId:    user.id,
          action:     `${action}_FEEDBACK`,
          targetType: 'Feedback',
          targetId:   params.id,
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN_FEEDBACK_REVIEW]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
