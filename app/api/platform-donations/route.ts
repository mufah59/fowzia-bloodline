import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const schema = z.object({
  name:        z.string().min(2).max(80),
  profession:  z.string().max(80).nullable().optional(),
  bkashNumber: z.string().regex(/^01[0-9]{9}$/),
  amount:      z.number().min(120).max(1_000_000),
  txReference: z.string().max(100).nullable().optional(),
  message:     z.string().max(300).nullable().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { name, profession, bkashNumber, amount, txReference, message } = parsed.data

    // Rate-limit: one submission per bKash number per hour
    const recent = await db.platformDonation.findFirst({
      where: { bkashNumber, createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
    })
    if (recent) {
      return NextResponse.json({ error: 'A submission from this number was already received. Please wait before submitting again.' }, { status: 429 })
    }

    const coconutsCount = Math.floor(amount / 120)

    await db.platformDonation.create({
      data: {
        name:        name.trim(),
        profession:  profession?.trim() ?? null,
        bkashNumber: bkashNumber.trim(),
        amount,
        txReference: txReference?.trim() ?? null,
        message:     message?.trim() ?? null,
        coconutsCount,
        isVerified:  false,
        isPublic:    true,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[PLATFORM_DONATION_POST]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const [donations, stats] = await Promise.all([
      db.platformDonation.findMany({
        where:   { isVerified: true, isPublic: true },
        orderBy: { createdAt: 'desc' },
        select:  { id: true, name: true, profession: true, amount: true, coconutsCount: true, message: true, createdAt: true },
      }),
      db.platformDonation.aggregate({
        where:  { isVerified: true },
        _sum:   { amount: true, coconutsCount: true },
        _count: { id: true },
      }),
    ])
    return NextResponse.json({ donations, stats })
  } catch (err) {
    console.error('[PLATFORM_DONATION_GET]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
