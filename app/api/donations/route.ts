import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  donationDate:  z.string().datetime(),
  hospitalName:  z.string().min(2).max(200),
  notes:         z.string().max(500).optional(),
  proofImageUrl: z.string().url(),
})

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.user_metadata?.role !== 'DONOR') return NextResponse.json({ error: 'Donors only.' }, { status: 403 })

  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const donorProfile = await db.donorProfile.findUnique({ where: { userId: user.id } })
    if (!donorProfile) return NextResponse.json({ error: 'Donor profile not found.' }, { status: 404 })

    const recent = await db.donationEvent.findFirst({
      where: { donorProfileId: donorProfile.id, createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
    })
    if (recent) return NextResponse.json({ error: 'Please wait before submitting another event.' }, { status: 429 })

    const event = await db.donationEvent.create({
      data: {
        donorProfileId: donorProfile.id,
        donationDate:   new Date(parsed.data.donationDate),
        hospitalName:   parsed.data.hospitalName,
        notes:          parsed.data.notes ?? null,
        proofImageUrl:  parsed.data.proofImageUrl,
        status:         'PENDING',
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (err) {
    console.error('[DONATIONS_POST]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const donorProfile = await db.donorProfile.findUnique({ where: { userId: user.id } })
    if (!donorProfile) return NextResponse.json({ events: [] })

    const events = await db.donationEvent.findMany({
      where:   { donorProfileId: donorProfile.id },
      orderBy: { donationDate: 'desc' },
    })
    return NextResponse.json({ events })
  } catch (err) {
    console.error('[DONATIONS_GET]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
