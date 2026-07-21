import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import { z } from 'zod'

const DAILY_REQUEST_LIMIT = 5

const schema = z.object({
  donorProfileId: z.string().cuid(),
  bloodGroup:     z.enum(['A_POS','A_NEG','B_POS','B_NEG','AB_POS','AB_NEG','O_POS','O_NEG']),
  reason:         z.string().min(10).max(500),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.user_metadata?.role !== 'RECIPIENT') return NextResponse.json({ error: 'Recipients only.' }, { status: 403 })

  const requestedById = user.id

  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const todayCount = await db.contactRequest.count({
      where: { requestedById, createdAt: { gte: since } },
    })
    if (todayCount >= DAILY_REQUEST_LIMIT) {
      return NextResponse.json({ error: `You can only make ${DAILY_REQUEST_LIMIT} contact requests per day.` }, { status: 429 })
    }

    const existing = await db.contactRequest.findUnique({
      where: { requestedById_donorProfileId: { requestedById, donorProfileId: parsed.data.donorProfileId } },
    })
    if (existing) return NextResponse.json({ error: 'You have already requested contact with this donor.' }, { status: 409 })

    const request = await db.contactRequest.create({
      data: { requestedById, ...parsed.data, status: 'PENDING' },
      include: {
        donorProfile: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
    })

    // Look up isVerified from DB
    const dbUser = await db.user.findUnique({ where: { id: user.id }, select: { isVerified: true } })
    if (dbUser?.isVerified) {
      await db.contactRequest.update({
        where: { id: request.id },
        data:  { status: 'APPROVED', phoneRevealed: true },
      })
      return NextResponse.json({
        approved: true,
        phone:    request.donorProfile.user.phone,
        name:     request.donorProfile.user.name,
      })
    }

    return NextResponse.json({ approved: false, message: 'Your request is under review.' }, { status: 201 })
  } catch (err) {
    console.error('[CONTACT_REQUEST_POST]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
