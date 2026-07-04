import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { db } from '@/lib/db'
import { z } from 'zod'

const phoneRegex = /^01[0-9]{9}$/

const donorSchema = z.object({
  name:        z.string().min(2).max(80),
  phone:       z.string().regex(phoneRegex, 'Invalid phone number'),
  area:        z.string().min(1).max(100),
  bio:         z.string().max(500).optional().nullable(),
  bkashNumber: z.string().regex(phoneRegex, 'Invalid bKash number'),
})

const recipientSchema = z.object({
  name:  z.string().min(2).max(80),
  phone: z.string().regex(phoneRegex, 'Invalid phone number'),
  area:  z.string().min(1).max(100),
})

export async function PATCH(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = user.user_metadata?.role

  try {
    const body = await req.json()

    if (role === 'DONOR') {
      const parsed = donorSchema.safeParse(body)
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

      const { name, phone, area, bio, bkashNumber } = parsed.data

      const currentUser = await db.user.findUnique({ where: { id: user.id }, select: { phone: true } })
      if (currentUser?.phone !== phone) {
        const taken = await db.user.findUnique({ where: { phone } })
        if (taken) return NextResponse.json({ error: 'Phone number is already registered.' }, { status: 409 })
      }

      await db.user.update({ where: { id: user.id }, data: { name, phone } })
      await db.donorProfile.update({ where: { userId: user.id }, data: { area, bio: bio ?? null, bkashNumber } })

      return NextResponse.json({ success: true })
    }

    if (role === 'RECIPIENT') {
      const parsed = recipientSchema.safeParse(body)
      if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

      const { name, phone, area } = parsed.data

      const currentUser = await db.user.findUnique({ where: { id: user.id }, select: { phone: true } })
      if (currentUser?.phone !== phone) {
        const taken = await db.user.findUnique({ where: { phone } })
        if (taken) return NextResponse.json({ error: 'Phone number is already registered.' }, { status: 409 })
      }

      await db.user.update({ where: { id: user.id }, data: { name, phone } })
      await db.recipientProfile.update({ where: { userId: user.id }, data: { area } })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch (err) {
    console.error('[PROFILE_PATCH]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
