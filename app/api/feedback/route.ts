import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  donorProfileId: z.string().cuid(),
  rating:         z.number().int().min(1).max(5),
  message:        z.string().min(10).max(1000),
})

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (user.user_metadata?.role !== 'RECIPIENT') return NextResponse.json({ error: 'Recipients only.' }, { status: 403 })

  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

    const recipientId = user.id

    const existing = await db.feedback.findUnique({
      where: { donorProfileId_recipientId: { donorProfileId: parsed.data.donorProfileId, recipientId } },
    })
    if (existing) return NextResponse.json({ error: 'You have already submitted feedback for this donor.' }, { status: 409 })

    const donor = await db.donorProfile.findUnique({ where: { id: parsed.data.donorProfileId } })
    if (!donor) return NextResponse.json({ error: 'Donor not found.' }, { status: 404 })

    await db.feedback.create({
      data: {
        donorProfileId: parsed.data.donorProfileId,
        recipientId,
        rating:         parsed.data.rating,
        message:        parsed.data.message,
        status:         'PENDING',
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[FEEDBACK_POST]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
