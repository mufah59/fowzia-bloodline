import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { computeEligibility } from '@/lib/utils'

const schema = z.object({
  action:     z.enum(['APPROVED', 'REJECTED']),
  adminNotes: z.string().max(500).optional(),
})

const REWARD_AMOUNT = parseFloat(process.env.REWARD_AMOUNT_BDT ?? '30')

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.user_metadata?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const event = await db.donationEvent.findUnique({
      where:   { id: params.id },
      include: { donorProfile: true },
    })
    if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 })
    if (event.status !== 'PENDING') return NextResponse.json({ error: 'Already reviewed.' }, { status: 409 })

    const adminId = user.id

    if (parsed.data.action === 'APPROVED') {
      await db.$transaction(async tx => {
        await tx.donationEvent.update({
          where: { id: params.id },
          data: {
            status:     'APPROVED',
            adminNotes: parsed.data.adminNotes ?? null,
            reviewedAt: new Date(),
            reviewedBy: adminId,
          },
        })

        await tx.donorProfile.update({
          where: { id: event.donorProfileId },
          data: {
            lastDonationDate: event.donationDate,
            donationCount:    { increment: 1 },
            isEligible:       false,
          },
        })

        await tx.rewardTransaction.create({
          data: {
            donorProfileId:  event.donorProfileId,
            donationEventId: event.id,
            amount:          REWARD_AMOUNT,
            bkashNumber:     event.donorProfile.bkashNumber,
            status:          'PENDING',
          },
        })

        await tx.adminAction.create({
          data: {
            adminId,
            action:     'APPROVE_DONATION',
            targetType: 'DonationEvent',
            targetId:   params.id,
            notes:      parsed.data.adminNotes,
          },
        })
      })
    } else {
      await db.$transaction(async tx => {
        await tx.donationEvent.update({
          where: { id: params.id },
          data: {
            status:     'REJECTED',
            adminNotes: parsed.data.adminNotes ?? null,
            reviewedAt: new Date(),
            reviewedBy: adminId,
          },
        })
        await tx.adminAction.create({
          data: {
            adminId,
            action:     'REJECT_DONATION',
            targetType: 'DonationEvent',
            targetId:   params.id,
            notes:      parsed.data.adminNotes,
          },
        })
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[ADMIN_DONATION_REVIEW]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
